import API from '@/api/axios'

const CHAT_BASE = '/chat/conversations'

function getCurrentUserId(): string {
  const user = localStorage.getItem('user_data')
    || localStorage.getItem('currentUser')
    || localStorage.getItem('user')
  if (!user) return ''
  try {
    const parsed = JSON.parse(user)
    return parsed.id || parsed.user_id || ''
  } catch {
    return ''
  }
}

function getTripGroupChatName(tripId: string, tripTitle?: string): string {
  if (tripTitle && tripTitle.trim()) {
    return `Trip Chat: ${tripTitle}`
  }
  return `Trip Chat ${tripId}`
}

function normalizeResponse<T>(response: any): T {
  return response?.data ?? response
}

function matchesTripChat(chat: any, tripId: string, normalizedName: string, tripTitle?: string) {
  return String(chat.trip_id || chat.tripId || '') === tripId
    || String(chat.trip?.id || '') === tripId
    || String(chat.name || '') === normalizedName
    || (tripTitle && String(chat.name || '').includes(tripTitle))
}

export async function findTripGroupChat(tripId: string, tripTitle?: string): Promise<GroupChat | null> {
  const normalizedName = getTripGroupChatName(tripId, tripTitle)
  const userId = getCurrentUserId()

  // First try a server-side lookup by tripId (backend may return the chat even
  // to users who are not yet members). If that fails, fall back to fetching
  // the current user's chats and searching locally.
  try {
    // Try common variations of a "by-trip" lookup so different backend
    // implementations are supported.
    const attempts = [
      () => API.get(`${CHAT_BASE}/trip/${tripId}`),
      () => API.get(`${CHAT_BASE}/by-trip/${tripId}`),
      () => API.get(`${CHAT_BASE}/${tripId}`),
      () => API.get(CHAT_BASE, { params: { tripId, userId } }),
      () => API.get(CHAT_BASE, { params: { trip_id: tripId, userId } }),
      () => API.get(CHAT_BASE, { params: { tripId } }),
      () => API.get(CHAT_BASE, { params: { trip_id: tripId } }),
    ]

    for (const [idx, attempt] of attempts.entries()) {
      try {
        const { data } = await attempt()
        const remote = normalizeResponse<any>(data)
        const remoteChats: GroupChat[] = Array.isArray(remote) ? remote : (remote ? [remote] : [])
        const found = remoteChats.find(chat => matchesTripChat(chat, tripId, normalizedName, tripTitle))
        if (found) {
          console.debug(`findTripGroupChat: matched on attempt #${idx}`)
          return found
        }
      } catch (e) {
        // try next pattern
        console.debug(`findTripGroupChat: attempt #${idx} failed`, e)
        continue
      }
    }

    // Broad attempt: fetch all conversations (if backend allows) and search.
    try {
      const { data } = await API.get(CHAT_BASE, { params: userId ? { userId } : undefined })
      const remote = normalizeResponse<any>(data)
      const remoteChats: GroupChat[] = Array.isArray(remote) ? remote : (remote ? [remote] : [])
      const found = remoteChats.find(chat => matchesTripChat(chat, tripId, normalizedName, tripTitle))
      if (found) {
        console.debug('findTripGroupChat: matched via broad /chat/conversations fetch')
        return found
      }
    } catch (e) {
      console.debug('findTripGroupChat: broad fetch failed', e)
    }
  } catch (err) {
    // ignore and fall back to user's chats
    console.debug('findTripGroupChat: server-side lookup failed, falling back', err)
  }

  const chats = await getUserGroupChats()
  return chats.find(chat => matchesTripChat(chat, tripId, normalizedName, tripTitle)) ?? null
}

export interface GroupChatMember {
  id: string
  name: string
  email: string
  avatar_url?: string
}

export interface GroupChat {
  id: string
  name: string
  description?: string
  trip_id?: string
  creator_id?: string
  members: GroupChatMember[]
  created_at?: string
  updated_at?: string
}

export interface GroupChatMessage {
  id: string
  group_chat_id?: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  text: string
  image_url?: string
  created_at: string
  updated_at: string
  status?: 'sent' | 'delivered' | 'seen' | 'deleted'
}

/**
 * Create a new group chat for a trip
 */
export async function createGroupChat(
  tripId: string,
  members: GroupChatMember[],
  tripTitle?: string,
): Promise<GroupChat> {
  const createdBy = getCurrentUserId()
  if (!createdBy) throw new Error('Not authenticated')

  const { data } = await API.post(CHAT_BASE, {
    createdBy,
    type: 'group',
    name: getTripGroupChatName(tripId, tripTitle),
    memberIds: members.map(m => m.id),
    // include tripId so backend can associate the conversation with the trip
    tripId,
    trip_id: tripId,
  })

  return normalizeResponse<GroupChat>(data)
}

/**
 * Get an existing group chat for a trip.
 * Creation requires explicit member context and should be handled separately.
 */
export async function getOrCreateGroupChat(
  tripId: string,
  tripTitle?: string,
  members?: GroupChatMember[],
): Promise<GroupChat | null> {
  const existing = await findTripGroupChat(tripId, tripTitle)
  if (existing) {
    return existing
  }

  if (members && members.length > 0) {
    return createGroupChat(tripId, members, tripTitle)
  }

  return null
}

/**
 * Get group chat by ID
 */
export async function getGroupChat(chatId: string): Promise<GroupChat> {
  const userId = getCurrentUserId()
  const { data } = await API.get(`${CHAT_BASE}/${chatId}`, {
    params: userId ? { userId } : undefined,
  })
  return normalizeResponse<GroupChat>(data)
}

/**
 * Get all group chats for current user
 */
export async function getUserGroupChats(): Promise<GroupChat[]> {
  const userId = getCurrentUserId()
  const { data } = await API.get(CHAT_BASE, {
    params: userId ? { userId } : undefined,
  })
  return normalizeResponse<GroupChat[]>(data)
}

/**
 * Get group chat messages
 */
export async function getGroupChatMessages(
  chatId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<GroupChatMessage[]> {
  const userId = getCurrentUserId()
  const { data } = await API.get(`${CHAT_BASE}/${chatId}/messages`, {
    params: {
      limit,
      offset,
      ...(userId ? { userId } : {}),
    },
  })
  return normalizeResponse<GroupChatMessage[]>(data)
}

/**
 * Send a message to group chat
 */
export async function sendGroupMessage(
  chatId: string,
  text: string,
  imageUrl?: string,
): Promise<GroupChatMessage> {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data } = await API.post(`${CHAT_BASE}/${chatId}/messages`, {
    senderId: userId,
    text,
    ...(imageUrl ? { imageUrl } : {}),
  })
  return normalizeResponse<GroupChatMessage>(data)
}

/**
 * Join a group chat
 */
export async function joinGroupChat(chatId: string): Promise<GroupChat> {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data } = await API.post(`${CHAT_BASE}/${chatId}/join`, {
    userId,
  })
  return normalizeResponse<GroupChat>(data)
}

/**
 * Leave a group chat
 */
export async function leaveGroupChat(chatId: string): Promise<void> {
  const userId = getCurrentUserId()
  await API.post(`${CHAT_BASE}/${chatId}/leave`, userId ? { userId } : undefined)
}

/**
 * Add member to group chat
 */
export async function addGroupChatMember(chatId: string, userId: string): Promise<GroupChat> {
  const { data } = await API.post(`${CHAT_BASE}/${chatId}/members`, {
    userId,
  })
  return normalizeResponse<GroupChat>(data)
}

/**
 * Remove member from group chat
 */
export async function removeGroupChatMember(chatId: string, userId: string): Promise<void> {
  await API.delete(`${CHAT_BASE}/${chatId}/members/${userId}`)
}

/**
 * Mark message as seen
 */
export async function markGroupMessageAsSeen(chatId: string, messageId: string): Promise<void> {
  const userId = getCurrentUserId()
  await API.put(`${CHAT_BASE}/${chatId}/messages/${messageId}/seen`, userId ? { userId } : undefined)
}

/**
 * Delete a message
 */
export async function deleteGroupMessage(chatId: string, messageId: string): Promise<void> {
  await API.delete(`${CHAT_BASE}/${chatId}/messages/${messageId}`)
}

/**
 * Update group chat info
 */
export async function updateGroupChat(
  chatId: string,
  data: Partial<{ name: string; description: string }>,
): Promise<GroupChat> {
  const { data: response } = await API.put(`${CHAT_BASE}/${chatId}`, data)
  return normalizeResponse<GroupChat>(response)
}
