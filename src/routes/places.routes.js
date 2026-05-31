const express = require('express')
const axios   = require('axios')          // npm install axios
const router  = express.Router()

const GOOGLE_BASE = 'https://maps.googleapis.com/maps/api/place'
const KEY         = process.env.GOOGLE_PLACES_KEY
const { requireAuth } = require('../middleware/auth')   // adjust path as needed

router.get('/places', requireAuth, async (req, res) => {
  const { lat, lng, type, radius = 15000, keyword } = req.query

  if (!lat || !lng || !type) {
    return res.status(400).json({ message: 'lat, lng, and type are required' })
  }
  if (!KEY) {
    return res.status(500).json({ message: 'GOOGLE_PLACES_KEY not configured on server' })
  }

  try {
    const params = {
      location: `${lat},${lng}`,
      radius,
      type,
      key: KEY,
      language: 'en',
    }
    if (keyword) params.keyword = keyword

    const { data } = await axios.get(`${GOOGLE_BASE}/nearbysearch/json`, { params })

    // Only forward what the frontend needs — never forward the API key
    return res.json({
      status:  data.status,
      results: (data.results ?? []).map(p => ({
        place_id:          p.place_id,
        name:              p.name,
        vicinity:          p.vicinity,
        rating:            p.rating,
        user_ratings_total: p.user_ratings_total,
        opening_hours:     p.opening_hours,
        geometry:          { location: p.geometry.location },
        photos:            p.photos?.slice(0, 1).map(ph => ({
          photo_reference: ph.photo_reference,
          width:           ph.width,
          height:          ph.height,
        })) ?? [],
        types: p.types,
      })),
    })
  } catch (err) {
    console.error('[Places proxy] nearbysearch error:', err.message)
    return res.status(502).json({ message: 'Failed to fetch from Google Places' })
  }
})

router.get('/places/photo', requireAuth, async (req, res) => {
  const { ref, maxwidth = 400 } = req.query

  if (!ref)  return res.status(400).json({ message: 'ref is required' })
  if (!KEY)  return res.status(500).json({ message: 'GOOGLE_PLACES_KEY not configured' })

  try {
    const response = await axios.get(`${GOOGLE_BASE}/photo`, {
      params:       { photoreference: ref, maxwidth, key: KEY },
      responseType: 'stream',
    })

    res.setHeader('Content-Type', response.headers['content-type'] ?? 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')   // cache 1 day
    response.data.pipe(res)
  } catch (err) {
    console.error('[Places proxy] photo error:', err.message)
    return res.status(502).json({ message: 'Failed to fetch photo' })
  }
})

router.get('/places/details/:placeId', requireAuth, async (req, res) => {
  const { placeId } = req.params
  if (!KEY) return res.status(500).json({ message: 'GOOGLE_PLACES_KEY not configured' })

  try {
    const fields = [
      'name', 'formatted_address', 'formatted_phone_number',
      'website', 'rating', 'user_ratings_total',
      'opening_hours', 'photos', 'reviews',
      'geometry', 'price_level', 'editorial_summary',
    ].join(',')

    const { data } = await axios.get(`${GOOGLE_BASE}/details/json`, {
      params: { place_id: placeId, fields, key: KEY, language: 'en' },
    })

    return res.json(data.result ?? {})
  } catch (err) {
    console.error('[Places proxy] details error:', err.message)
    return res.status(502).json({ message: 'Failed to fetch place details' })
  }
})

module.exports = router