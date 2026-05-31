const express    = require('express')
const { v4: uuid } = require('uuid')         // npm install uuid
const router     = express.Router()
const { requireAuth } = require('../middleware/auth')

// Replace with your actual DB client (Prisma shown here)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/trips
// Create a new trip plan with itinerary items.
//
// Body: {
//   origin, destination, start_date, end_date, travel_type,
//   itinerary_items: [
//     { day_index, title, location, description, start_time, sort_order, place_id }
//   ]
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { origin, destination, start_date, end_date, travel_type, itinerary_items = [] } = req.body
  const userId = req.user.id

  if (!origin || !destination || !start_date || !end_date) {
    return res.status(400).json({ message: 'origin, destination, start_date, end_date are required' })
  }

  try {
    const invite_token = uuid()

    const trip = await prisma.trip.create({
      data: {
        title:        `${origin} → ${destination}`,
        destination:  `${origin} → ${destination}`,
        origin,
        start_date:   new Date(start_date),
        end_date:     new Date(end_date),
        travel_type,
        invite_token,
        owner_id:     userId,
        // Create member record for owner
        members: {
          create: { user_id: userId, role: 'owner' },
        },
        // Create itinerary items
        itinerary_items: {
          create: itinerary_items.map(item => ({
            id:          uuid(),
            day_index:   item.day_index   ?? 0,
            title:       item.title       ?? '',
            location:    item.location    ?? '',
            description: item.description ?? '',
            start_time:  item.start_time  ?? '',
            sort_order:  item.sort_order  ?? 0,
            place_id:    item.place_id    ?? null,
          })),
        },
      },
      include: {
        itinerary_items: { orderBy: [{ day_index: 'asc' }, { sort_order: 'asc' }] },
        members: true,
        packing_list: true,
      },
    })

    return res.status(201).json(trip)
  } catch (err) {
    console.error('[trips] create error:', err)
    return res.status(500).json({ message: 'Failed to create trip' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trips/:id
// Fetch a single trip (owner or member only).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const userId  = req.user.id

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        itinerary_items: { orderBy: [{ day_index: 'asc' }, { sort_order: 'asc' }] },
        members:         true,
        packing_list:    true,
      },
    })

    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const isMember = trip.members.some(m => m.user_id === userId)
    if (!isMember) return res.status(403).json({ message: 'Forbidden' })

    return res.json(trip)
  } catch (err) {
    console.error('[trips] get error:', err)
    return res.status(500).json({ message: 'Failed to fetch trip' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trips
// List all trips for the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id

  try {
    const trips = await prisma.trip.findMany({
      where:   { members: { some: { user_id: userId } } },
      include: {
        itinerary_items: { orderBy: [{ day_index: 'asc' }, { sort_order: 'asc' }] },
        members:         true,
        packing_list:    true,
      },
      orderBy: { created_at: 'desc' },
    })

    return res.json(trips)
  } catch (err) {
    console.error('[trips] list error:', err)
    return res.status(500).json({ message: 'Failed to list trips' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/trips/:id/itinerary
// Replace all itinerary items for a trip (used by "Save Plan" button).
//
// Body: {
//   itinerary_items: [
//     { day_index, title, location, description, start_time, sort_order, place_id }
//   ]
// }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/itinerary', requireAuth, async (req, res) => {
  const { id }    = req.params
  const userId    = req.user.id
  const { itinerary_items = [], origin, destination, start_date, end_date, travel_type } = req.body

  try {
    // Verify ownership/membership
    const trip = await prisma.trip.findUnique({
      where:   { id },
      include: { members: true },
    })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const isMember = trip.members.some(m => m.user_id === userId)
    if (!isMember) return res.status(403).json({ message: 'Forbidden' })

    // Use a transaction: delete old items → insert new ones → update trip meta
    const updated = await prisma.$transaction([
      // 1. Clear old itinerary
      prisma.itineraryItem.deleteMany({ where: { trip_id: id } }),

      // 2. Insert new items
      ...itinerary_items.map(item =>
        prisma.itineraryItem.create({
          data: {
            id:          uuid(),
            trip_id:     id,
            day_index:   item.day_index   ?? 0,
            title:       item.title       ?? '',
            location:    item.location    ?? '',
            description: item.description ?? '',
            start_time:  item.start_time  ?? '',
            sort_order:  item.sort_order  ?? 0,
            place_id:    item.place_id    ?? null,
          },
        })
      ),

      // 3. Update trip metadata if provided
      prisma.trip.update({
        where: { id },
        data: {
          ...(origin      && { origin }),
          ...(destination && { destination: `${origin} → ${destination}`, title: `${origin} → ${destination}` }),
          ...(start_date  && { start_date: new Date(start_date) }),
          ...(end_date    && { end_date:   new Date(end_date)   }),
          ...(travel_type && { travel_type }),
          updated_at: new Date(),
        },
        include: {
          itinerary_items: { orderBy: [{ day_index: 'asc' }, { sort_order: 'asc' }] },
          members: true,
          packing_list: true,
        },
      }),
    ])

    // Last element in transaction array is the updated trip
    return res.json(updated[updated.length - 1])
  } catch (err) {
    console.error('[trips] update itinerary error:', err)
    return res.status(500).json({ message: 'Failed to update itinerary' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/trips/:id
// Delete a trip (owner only).
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const userId  = req.user.id

  try {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { members: true } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const isOwner = trip.members.some(m => m.user_id === userId && m.role === 'owner')
    if (!isOwner) return res.status(403).json({ message: 'Only the owner can delete a trip' })

    // Cascade deletes itinerary_items, members, packing_list (configure in Prisma schema)
    await prisma.trip.delete({ where: { id } })

    return res.json({ message: 'Trip deleted' })
  } catch (err) {
    console.error('[trips] delete error:', err)
    return res.status(500).json({ message: 'Failed to delete trip' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/trips/join/:token
// Join a trip via invite link.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/join/:token', requireAuth, async (req, res) => {
  const { token } = req.params
  const userId    = req.user.id

  try {
    const trip = await prisma.trip.findUnique({
      where:   { invite_token: token },
      include: { members: true },
    })
    if (!trip) return res.status(404).json({ message: 'Invalid invite link' })

    const alreadyMember = trip.members.some(m => m.user_id === userId)
    if (alreadyMember)  return res.json({ message: 'Already a member', trip })

    const updated = await prisma.trip.update({
      where: { id: trip.id },
      data: {
        members: { create: { user_id: userId, role: 'member' } },
      },
      include: {
        itinerary_items: { orderBy: [{ day_index: 'asc' }, { sort_order: 'asc' }] },
        members: true,
        packing_list: true,
      },
    })

    return res.status(201).json(updated)
  } catch (err) {
    console.error('[trips] join error:', err)
    return res.status(500).json({ message: 'Failed to join trip' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/trips/:id/packing/:itemId/toggle
// Toggle a packing list item.
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/packing/:itemId/toggle', requireAuth, async (req, res) => {
  const { id, itemId } = req.params
  const userId         = req.user.id

  try {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { members: true } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const isMember = trip.members.some(m => m.user_id === userId)
    if (!isMember) return res.status(403).json({ message: 'Forbidden' })

    const item = await prisma.packingItem.findUnique({ where: { id: itemId } })
    if (!item)  return res.status(404).json({ message: 'Packing item not found' })

    const updated = await prisma.packingItem.update({
      where: { id: itemId },
      data:  { packed: !item.packed },
    })

    return res.json(updated)
  } catch (err) {
    console.error('[trips] packing toggle error:', err)
    return res.status(500).json({ message: 'Failed to toggle item' })
  }
})


module.exports = router


/* ═══════════════════════════════════════════════════════════════════════════
   PRISMA SCHEMA ADDITIONS
   Add these models to your schema.prisma file.
   Run:  npx prisma migrate dev --name add_trip_planner
   ═══════════════════════════════════════════════════════════════════════════

model Trip {
  id           String          @id @default(uuid())
  title        String
  destination  String          // "Phnom Penh → Siem Reap"
  origin       String
  start_date   DateTime
  end_date     DateTime
  travel_type  String          @default("friends")
  invite_token String          @unique @default(uuid())
  owner_id     String
  created_at   DateTime        @default(now())
  updated_at   DateTime        @updatedAt

  owner            User              @relation(fields: [owner_id], references: [id])
  members          TripMember[]
  itinerary_items  ItineraryItem[]
  packing_list     PackingItem[]
}

model TripMember {
  id      String @id @default(uuid())
  trip_id String
  user_id String
  role    String @default("member")  // "owner" | "member"

  trip Trip @relation(fields: [trip_id], references: [id], onDelete: Cascade)
  user User @relation(fields: [user_id], references: [id])

  @@unique([trip_id, user_id])
}

model ItineraryItem {
  id          String   @id @default(uuid())
  trip_id     String
  day_index   Int      @default(0)   // 0-based
  title       String
  location    String   @default("")
  description String   @default("")
  start_time  String   @default("")
  sort_order  Int      @default(0)
  place_id    String?  // Google place_id (optional)
  created_at  DateTime @default(now())

  trip Trip @relation(fields: [trip_id], references: [id], onDelete: Cascade)
}

model PackingItem {
  id       String  @id @default(uuid())
  trip_id  String
  name     String
  quantity Int     @default(1)
  packed   Boolean @default(false)

  trip Trip @relation(fields: [trip_id], references: [id], onDelete: Cascade)
}

*/