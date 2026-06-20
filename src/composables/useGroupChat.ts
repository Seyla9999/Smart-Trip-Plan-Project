import { ref, computed } from 'vue'
import * as groupChatService from '../services/group-chat.service'
import type { GroupChat, GroupChatMessage, GroupChatMember } from '../services/group-chat.service'

export function useGroupChat() {
  const groupChats = ref<GroupChat[]>([])
  const currentChat = ref<GroupChat | null>(null)
  const messages = ref<GroupChatMessage[]>([])
  const isLoading = ref(false)
  const isLoadingMessages = ref(false)
  const error = ref<string | null>(null)
  const isTyping = ref(false)

  const currentUserId = computed(() => {
    const user = localStorage.getItem('user_data')
      || localStorage.getItem('currentUser')
      || localStorage.getItem('user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        return parsed.id || parsed.user_id || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  /**
   * Fetch all group chats for the current user
   */
  const fetchGroupChats = async () => {
    isLoading.value = true
    error.value = null
    try {
      groupChats.value = await groupChatService.getUserGroupChats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch group chats'
      console.error('Error fetching group chats:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get or create a group chat for a specific trip
   */
  const getOrCreateChatForTrip = async (tripId: string, tripTitle?: string, members?: GroupChatMember[]) => {
    isLoading.value = true
    error.value = null
    try {
      currentChat.value = await groupChatService.getOrCreateGroupChat(tripId, tripTitle, members)
      if (
        currentChat.value
        && currentChat.value.id
        && currentUserId.value
        && !currentChat.value.members?.some(m => String(m.id) === String(currentUserId.value))
      ) {
        await groupChatService.joinGroupChat(currentChat.value.id)
      }

      if (currentChat.value?.id) {
        await fetchMessages()
      }
      return currentChat.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get or create group chat'
      console.error('Error getting/creating group chat:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new group chat
   */
  const createChat = async (tripId: string, members: GroupChatMember[], tripTitle?: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentChat.value = await groupChatService.createGroupChat(tripId, members, tripTitle)
      messages.value = []
      return currentChat.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create group chat'
      console.error('Error creating group chat:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select a group chat and load its messages
   */
  const selectChat = async (chat: GroupChat) => {
    currentChat.value = chat
    await fetchMessages()
  }

  /**
   * Fetch messages for the current chat
   */
  const fetchMessages = async (limit = 50, offset = 0) => {
    if (!currentChat.value || !currentChat.value.id){
      console.debug("Skipping fetchMessages: No valid Chat ID.");
      return
    }

    isLoadingMessages.value = true
    error.value = null
    try {
      const fetchedMessages = await groupChatService.getGroupChatMessages(
        currentChat.value.id,
        limit,
        offset,
      )
      messages.value = fetchedMessages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
      console.error('Error fetching messages:', err)
    } finally {
      isLoadingMessages.value = false
    }
  }

  /**
   * Send a message to the current group chat
   */
  const sendMessage = async (text: string, imageUrl?: string) => {
    if (!currentChat.value) return null

    error.value = null
    try {
      const newMessage = await groupChatService.sendGroupMessage(currentChat.value.id, text, imageUrl)
      messages.value.push(newMessage)
      return newMessage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      console.error('Error sending message:', err)
      return null
    }
  }

  /**
   * Join a group chat
   */
  const joinChat = async (chatId: string) => {

    if (!chatId) {
      console.debug("Cannot join chat: Chat ID is missing.");
      return null
    }
    isLoading.value = true
    error.value = null
    try {
      await groupChatService.joinGroupChat(chatId)
      await fetchMessages()
      return currentChat.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join group chat'
      console.error('Error joining group chat:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Leave a group chat
   */
  const leaveChat = async (chatId?: string) => {
    const targetChatId = chatId || currentChat.value?.id
    if (!targetChatId) return

    error.value = null
    try {
      await groupChatService.leaveGroupChat(targetChatId)
      if (currentChat.value?.id === targetChatId) {
        currentChat.value = null
        messages.value = []
      }
      groupChats.value = groupChats.value.filter(c => c.id !== targetChatId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to leave group chat'
      console.error('Error leaving group chat:', err)
    }
  }

  /**
   * Add a member to the group chat
   */
  const addMember = async (userId: string) => {
    if (!currentChat.value) return

    error.value = null
    try {
      const updatedChat = await groupChatService.addGroupChatMember(currentChat.value.id, userId)
      currentChat.value = updatedChat
      return updatedChat
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add member'
      console.error('Error adding member:', err)
      return null
    }
  }

  /**
   * Remove a member from the group chat
   */
  const removeMember = async (userId: string) => {
    if (!currentChat.value) return

    error.value = null
    try {
      await groupChatService.removeGroupChatMember(currentChat.value.id, userId)
      currentChat.value.members = currentChat.value.members.filter(m => m.id !== userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove member'
      console.error('Error removing member:', err)
    }
  }

  /**
   * Mark a message as seen
   */
  const markMessageAsSeen = async (messageId: string) => {
    if (!currentChat.value) return

    try {
      await groupChatService.markGroupMessageAsSeen(currentChat.value.id, messageId)
      const message = messages.value.find(m => m.id === messageId)
      if (message) {
        message.status = 'seen'
      }
    } catch (err) {
      console.error('Error marking message as seen:', err)
    }
  }

  /**
   * Delete a message
   */
  const deleteMessage = async (messageId: string) => {
    if (!currentChat.value) return

    error.value = null
    try {
      await groupChatService.deleteGroupMessage(currentChat.value.id, messageId)
      messages.value = messages.value.filter(m => m.id !== messageId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete message'
      console.error('Error deleting message:', err)
    }
  }

  return {
    // State
    groupChats,
    currentChat,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    isTyping,
    currentUserId,

    // Methods
    fetchGroupChats,
    getOrCreateChatForTrip,
    createChat,
    selectChat,
    fetchMessages,
    sendMessage,
    joinChat,
    leaveChat,
    addMember,
    removeMember,
    markMessageAsSeen,
    deleteMessage,
  }
}
