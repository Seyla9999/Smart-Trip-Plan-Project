import api from '@/api/axios'

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
  trip_id: string
  creator_id: string
  members: GroupChatMember[]
  created_at: string
  updated_at: string
}

export interface GroupChatMessage {
  id: string
  group_chat_id: string
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
export async function createGroupChat(tripId: string, members: GroupChatMember[]): Promise<GroupChat> {
  const { data } = await api.post('/group-chats', {
    trip_id: tripId,
    members: members.map(m => m.id),
  })
  return data
}

/**
 * Get or create a group chat for a trip
 */
export async function getOrCreateGroupChat(tripId: string): Promise<GroupChat> {
  const { data } = await api.post(`/group-chats/trip/${tripId}`)
  return data
}

/**
 * Get group chat by ID
 */
export async function getGroupChat(chatId: string): Promise<GroupChat> {
  const { data } = await api.get(`/group-chats/${chatId}`)
  return data
}

/**
 * Get all group chats for current user
 */
export async function getUserGroupChats(): Promise<GroupChat[]> {
  const { data } = await api.get('/group-chats')
  return data.data || data
}

/**
 * Get group chat messages
 */
export async function getGroupChatMessages(
  chatId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<GroupChatMessage[]> {
  const { data } = await api.get(`/group-chats/${chatId}/messages`, {
    params: { limit, offset },
  })
  return data.data || data
}

/**
 * Send a message to group chat
 */
export async function sendGroupMessage(
  chatId: string,
  text: string,
  imageUrl?: string,
): Promise<GroupChatMessage> {
  const { data } = await api.post(`/group-chats/${chatId}/messages`, {
    text,
    image_url: imageUrl,
  })
  return data
}

/**
 * Join a group chat
 */
export async function joinGroupChat(chatId: string): Promise<GroupChat> {
  const { data } = await api.post(`/group-chats/${chatId}/join`)
  return data
}

/**
 * Leave a group chat
 */
export async function leaveGroupChat(chatId: string): Promise<void> {
  await api.post(`/group-chats/${chatId}/leave`)
}

/**
 * Add member to group chat
 */
export async function addGroupChatMember(chatId: string, userId: string): Promise<GroupChat> {
  const { data } = await api.post(`/group-chats/${chatId}/members`, {
    user_id: userId,
  })
  return data
}

/**
 * Remove member from group chat
 */
export async function removeGroupChatMember(chatId: string, userId: string): Promise<void> {
  await api.delete(`/group-chats/${chatId}/members/${userId}`)
}

/**
 * Mark message as seen
 */
export async function markGroupMessageAsSeen(chatId: string, messageId: string): Promise<void> {
  await api.put(`/group-chats/${chatId}/messages/${messageId}/seen`)
}

/**
 * Delete a message
 */
export async function deleteGroupMessage(chatId: string, messageId: string): Promise<void> {
  await api.delete(`/group-chats/${chatId}/messages/${messageId}`)
}

/**
 * Update group chat info
 */
export async function updateGroupChat(
  chatId: string,
  data: Partial<{ name: string; description: string }>,
): Promise<GroupChat> {
  const { data: response } = await api.put(`/group-chats/${chatId}`, data)
  return response
}
