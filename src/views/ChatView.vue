<template>
  <div class="chat-page" v-if="loggedInUser">
    <div class="chat-layout">
      <div class="sidebar" :class="{ 'mobile-show': showSidebar }">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Messages</h2>
          <div class="search-wrap">
            <span>🔍</span>
            <input v-model="searchQuery" class="search-input" placeholder="Search..." />
          </div>
          <button class="new-chat-btn" @click="showNewChat = true">New Chat</button>
        </div>

        <div v-if="convsLoading && conversations.length === 0" class="sidebar-loading">
          <div class="spinner" /> Loading...
        </div>

        <div v-else class="contacts">
          <div v-for="c in filteredContacts" :key="c.id"
               class="contact" :class="{ active: activeConv?.id === c.id }"
               @click="selectConversation(c)">
            <div class="c-avatar" :style="{ background: getConvColor(c) }">
              <img v-if="getConvAvatar(c)" :src="getAvatarSrc(getConvAvatar(c))" class="c-avatar-img" />
              <span v-else>{{ getConvInitials(c) }}</span>
            </div>
            <div class="c-info">
              <div class="c-name">{{ getConvName(c) }}</div>
              <div class="c-preview">{{ c.last_message || 'No messages yet' }}</div>
            </div>
            <div class="c-meta">
              <span class="c-time">{{ formatTime(c.last_message_at || c.updated_at) }}</span>
              <span v-if="c.unread_count > 0" class="c-badge">
                {{ c.unread_count > 9 ? '9+' : c.unread_count }}
              </span>
            </div>
          </div>
          <div v-if="filteredContacts.length === 0 && !convsLoading" class="no-contacts">
            <div style="font-size:32px;margin-bottom:8px">💬</div>
            No conversations yet.<br/>Start a new chat!
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div v-if="!activeConv" class="no-chat">
          <div class="no-chat-icon">💬</div>
          <h3 class="no-chat-title">Your Messages</h3>
          <p class="no-chat-sub">Select a conversation or start a new chat</p>
          <button class="new-chat-big-btn" @click="showNewChat = true">Start New Chat</button>
        </div>

        <template v-else>
          <div class="chat-header">
            <button class="back-btn" @click="showSidebar = true">←</button>
            <div class="ch-avatar" :style="{ background: getConvColor(activeConv) }">
              <img v-if="getConvAvatar(activeConv)" :src="getAvatarSrc(getConvAvatar(activeConv))" class="c-avatar-img" />
              <span v-else>{{ getConvInitials(activeConv) }}</span>
            </div>
            <div class="ch-info">
              <div class="ch-name">{{ getConvName(activeConv) }}</div>
              <div class="ch-sub">
                {{ activeConv.type === 'group'
                  ? `${activeConv.members?.length || 0} members`
                  : 'Direct message' }}
              </div>
            </div>
          </div>

          <div v-if="msgsLoading" class="messages-loading">
            <div class="spinner" /> Loading messages...
          </div>

          <div v-else class="messages" ref="messagesEl">
            <template v-for="(group, date) in groupedMessages" :key="date">
              <div class="date-divider">{{ date }}</div>

              <div v-for="msg in group" :key="msg.id"
                   class="msg-row"
                   :class="msg.sender_id === loggedInUser.id ? 'msg-right' : 'msg-left'">

                <!-- ✅ LEFT: other person's avatar -->
                <div v-if="msg.sender_id !== loggedInUser.id"
                     class="msg-avatar"
                     :style="{ background: getSenderColor(msg.sender_id) }">
                  <img v-if="msg.sender_avatar" :src="getAvatarSrc(msg.sender_avatar)" class="msg-avatar-img" />
                  <span v-else>{{ getInitials(msg.sender_name) }}</span>
                </div>

                <div class="msg-content">
                  <!-- ✅ Show sender name ONLY on left side in GROUP chats -->
                  <div v-if="msg.sender_id !== loggedInUser.id && activeConv.type === 'group'"
                       class="msg-sender-name">
                    {{ msg.sender_name }}
                  </div>

                  <div class="bubble"
                       :class="msg.sender_id === loggedInUser.id ? 'bubble-mine' : 'bubble-theirs'">
                    {{ msg.text }}
                  </div>

                  <!-- ✅ Time always shown -->
                  <!-- ✅ RIGHT side: show sent/seen status -->
                  <div class="msg-time" :class="{ 'time-right': msg.sender_id === loggedInUser.id }">
                    {{ formatMsgTime(msg.created_at) }}
                    <span v-if="msg.sender_id === loggedInUser.id" class="msg-status">
                      {{ msg.id.startsWith('temp-') ? '🕐' : '✓✓' }}
                    </span>
                  </div>
                </div>

                <!-- ✅ RIGHT side: NO avatar — just like Facebook/Instagram -->
                <!-- We intentionally don't show avatar on right side -->
              </div>
            </template>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="msg-row msg-left">
              <div class="msg-avatar" :style="{ background: getConvColor(activeConv) }">
                {{ getConvInitials(activeConv) }}
              </div>
              <div class="bubble bubble-theirs typing-bubble">
                <span class="dot"/><span class="dot"/><span class="dot"/>
              </div>
            </div>
          </div>

          <div class="input-area">
            <input v-model="newMessage" class="msg-input"
                   :placeholder="`Message ${getConvName(activeConv)}...`"
                   @keydown.enter="sendMessage" :disabled="sending" />
            <button class="send-btn" @click="sendMessage"
                    :disabled="!newMessage.trim() || sending">
              {{ sending ? '⏳' : '➤' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ─── NEW CHAT MODAL ─── -->
    <div v-if="showNewChat" class="modal-overlay" @click.self="showNewChat = false">
      <div class="modal">
        <div class="modal-title">New Conversation</div>
        <div class="modal-tabs">
          <button :class="{ active: newChatType === 'direct' }" @click="newChatType = 'direct'">
            👤 Direct
          </button>
          <button :class="{ active: newChatType === 'group' }" @click="newChatType = 'group'">
            👥 Group
          </button>
        </div>

        <div v-if="newChatType === 'group'" class="form-group">
          <label class="form-label">Group Name</label>
          <input v-model="newGroupName" class="form-input" placeholder="e.g. Siem Reap Trip" />
        </div>

        <!-- ✅ Search by EMAIL — unique, easy to share -->
        <div class="form-group">
          <label class="form-label">
            {{ newChatType === 'direct' ? 'Search by Email or Username' : 'Add Member by Email' }}
          </label>
          <div class="search-user-wrap">
            <input v-model="searchUserInput" class="form-input"
                   placeholder="Enter email address..."
                   @input="searchUsers" />
          </div>

          <!-- Search results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="u in searchResults" :key="u.id"
                 class="search-result-item"
                 :class="{ selected: selectedUsers.find(s => s.id === u.id) }"
                 @click="toggleSelectUser(u)">
              <div class="sr-avatar" :style="{ background: getColorFromName(u.full_name) }">
                <img v-if="u.avatar_url" :src="getAvatarSrc(u.avatar_url)" class="c-avatar-img" />
                <span v-else>{{ getInitials(u.full_name) }}</span>
              </div>
              <div class="sr-info">
                <div class="sr-name">{{ u.full_name }}</div>
                <div class="sr-email">{{ u.email }}</div>
              </div>
              <div v-if="selectedUsers.find(s => s.id === u.id)" class="sr-check">✓</div>
            </div>
          </div>

          <!-- Selected users -->
          <div v-if="selectedUsers.length > 0" class="selected-users">
            <span v-for="u in selectedUsers" :key="u.id" class="selected-chip">
              {{ u.full_name }}
              <button @click="toggleSelectUser(u)">×</button>
            </span>
          </div>

          <div v-if="searchUserInput && searchResults.length === 0 && !searchingUsers" class="no-results">
            No user found with that email
          </div>
        </div>

        <div v-if="newChatError" class="form-error">{{ newChatError }}</div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeNewChat">Cancel</button>
          <button class="btn-start" @click="startConversation"
                  :disabled="creating || selectedUsers.length === 0">
            {{ creating ? 'Creating...' : 'Start Chat' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-logged-in">
    <div class="nli-icon">🔒</div>
    <h2 class="nli-title">Please log in to access messages</h2>
    <a href="/login" class="btn-login-big">Login</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const COLORS  = ['#1D3557','#2D6A4F','#C8922A','#5C4B8A','#AE2012','#2196A6','#6B4C3B']

export default defineComponent({
  name: 'ChatView',
  setup() {
    const loggedInUser   = ref<any>(null)
    const conversations  = ref<any[]>([])
    const messages       = ref<any[]>([])
    const activeConv     = ref<any>(null)
    const newMessage     = ref('')
    const searchQuery    = ref('')
    const showSidebar    = ref(true)
    const messagesEl     = ref<HTMLElement | null>(null)
    const convsLoading   = ref(false)
    const msgsLoading    = ref(false)
    const sending        = ref(false)
    const isTyping       = ref(false)

    // New chat modal
    const showNewChat     = ref(false)
    const newChatType     = ref<'direct'|'group'>('direct')
    const newGroupName    = ref('')
    const searchUserInput = ref('')
    const searchResults   = ref<any[]>([])
    const selectedUsers   = ref<any[]>([])
    const searchingUsers  = ref(false)
    const newChatError    = ref('')
    const creating        = ref(false)

    // ✅ Store last message count to avoid unnecessary re-renders
    let lastMsgCount  = 0
    let lastConvData  = ''
    let pollInterval: any = null
    let searchTimeout: any = null

    onMounted(async () => {
      const raw = localStorage.getItem('user_data') || localStorage.getItem('user')
      if (raw) {
        try {
          loggedInUser.value = JSON.parse(raw)
          await loadConversations()
          // ✅ Poll every 5s but only update if data changed
          pollInterval = setInterval(pollUpdates, 5000)
        } catch { loggedInUser.value = null }
      }
    })

    onUnmounted(() => { if (pollInterval) clearInterval(pollInterval) })

    // ── Load conversations ─────────────────────────────────────────
    async function loadConversations() {
      if (!loggedInUser.value?.id) return
      convsLoading.value = true
      try {
        const res  = await fetch(`${API_URL}/chat/conversations?userId=${loggedInUser.value.id}`)
        const data = await res.json()
        const newData = Array.isArray(data.data) ? data.data : []
        // ✅ Only update if data actually changed — prevents blinking
        const newDataStr = JSON.stringify(newData)
        if (newDataStr !== lastConvData) {
          conversations.value = newData
          lastConvData = newDataStr
        }
      } catch { conversations.value = [] }
      finally { convsLoading.value = false }
    }

    // ── Poll for updates without blinking ─────────────────────────
    async function pollUpdates() {
      if (!loggedInUser.value?.id) return
      try {
        // Poll conversations silently
        const res  = await fetch(`${API_URL}/chat/conversations?userId=${loggedInUser.value.id}`)
        const data = await res.json()
        const newData = Array.isArray(data.data) ? data.data : []
        const newDataStr = JSON.stringify(newData)
        // ✅ Only update UI if something actually changed
        if (newDataStr !== lastConvData) {
          conversations.value = newData
          lastConvData = newDataStr
        }

        // Poll active conversation messages
        if (activeConv.value) {
          const msgRes  = await fetch(
            `${API_URL}/chat/conversations/${activeConv.value.id}/messages?userId=${loggedInUser.value.id}`
          )
          const msgData = await msgRes.json()
          const newMsgs = Array.isArray(msgData.data) ? msgData.data : []
          // ✅ Only update if new messages arrived
          if (newMsgs.length > lastMsgCount) {
            messages.value = newMsgs
            lastMsgCount   = newMsgs.length
            scrollToBottom()
          }
        }
      } catch {}
    }

    // ── Load messages ──────────────────────────────────────────────
    async function loadMessages(convId: string) {
      msgsLoading.value = true
      lastMsgCount      = 0
      try {
        const res  = await fetch(
          `${API_URL}/chat/conversations/${convId}/messages?userId=${loggedInUser.value.id}`
        )
        const data = await res.json()
        messages.value = Array.isArray(data.data) ? data.data : []
        lastMsgCount   = messages.value.length
        scrollToBottom()
      } catch { messages.value = [] }
      finally { msgsLoading.value = false }
    }

    // ── Select conversation ────────────────────────────────────────
    async function selectConversation(conv: any) {
      activeConv.value  = conv
      showSidebar.value = false
      conv.unread_count = 0
      await loadMessages(conv.id)
    }

    // ── Send message ───────────────────────────────────────────────
    async function sendMessage() {
      if (!newMessage.value.trim() || !activeConv.value || sending.value) return
      const text = newMessage.value.trim()
      newMessage.value = ''
      sending.value    = true

      // Optimistic message
      const optimistic = {
        id:           'temp-' + Date.now(),
        sender_id:    loggedInUser.value.id,
        sender_name:  loggedInUser.value.full_name,
        sender_avatar: loggedInUser.value.avatar_url,
        text,
        created_at:   new Date().toISOString(),
      }
      messages.value.push(optimistic)
      lastMsgCount = messages.value.length
      scrollToBottom()

      try {
        const res  = await fetch(
          `${API_URL}/chat/conversations/${activeConv.value.id}/messages`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ senderId: loggedInUser.value.id, text }),
          }
        )
        const data = await res.json()
        if (data.success) {
          // Replace optimistic with real message
          const idx = messages.value.findIndex(m => m.id === optimistic.id)
          if (idx !== -1) messages.value[idx] = data.data
          // Update sidebar
          const conv = conversations.value.find(c => c.id === activeConv.value.id)
          if (conv) { conv.last_message = text; conv.last_message_at = new Date().toISOString() }
          lastConvData = '' // force refresh on next poll
        }
      } catch {}
      finally { sending.value = false }
    }

    // ── Search users by email ──────────────────────────────────────
    async function searchUsers() {
      const q = searchUserInput.value.trim()
      if (q.length < 2) { searchResults.value = []; return }

      // Debounce — wait 400ms after typing stops
      if (searchTimeout) clearTimeout(searchTimeout)
      searchTimeout = setTimeout(async () => {
        searchingUsers.value = true
        try {
          const res  = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`)
          const data = await res.json()
          // Filter out current user from results
          searchResults.value = (Array.isArray(data.data) ? data.data : [])
            .filter((u: any) => u.id !== loggedInUser.value?.id)
        } catch { searchResults.value = [] }
        finally { searchingUsers.value = false }
      }, 400)
    }

    function toggleSelectUser(user: any) {
      const idx = selectedUsers.value.findIndex(u => u.id === user.id)
      if (idx !== -1) {
        selectedUsers.value.splice(idx, 1)
      } else {
        // For direct chat, only 1 user
        if (newChatType.value === 'direct') {
          selectedUsers.value = [user]
        } else {
          selectedUsers.value.push(user)
        }
      }
    }

    // ── Create conversation ────────────────────────────────────────
    async function startConversation() {
      newChatError.value = ''
      if (selectedUsers.value.length === 0) { newChatError.value = 'Please select a user'; return }
      if (newChatType.value === 'group' && !newGroupName.value.trim()) {
        newChatError.value = 'Please enter a group name'; return
      }
      creating.value = true
      try {
        const res  = await fetch(`${API_URL}/chat/conversations`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createdBy:  loggedInUser.value.id,
            type:       newChatType.value,
            name:       newChatType.value === 'group' ? newGroupName.value : undefined,
            memberIds:  selectedUsers.value.map(u => u.id),
          }),
        })
        const data = await res.json()
        if (data.success) {
          closeNewChat()
          lastConvData = '' // force refresh
          await loadConversations()
          const newConv = conversations.value.find(c => c.id === data.data.id)
          if (newConv) selectConversation(newConv)
        } else {
          newChatError.value = data.message || 'Failed to create'
        }
      } catch { newChatError.value = 'Network error. Please try again.' }
      finally { creating.value = false }
    }

    function closeNewChat() {
      showNewChat.value    = false
      newGroupName.value   = ''
      searchUserInput.value = ''
      searchResults.value  = []
      selectedUsers.value  = []
      newChatError.value   = ''
    }

    // ── Helpers ────────────────────────────────────────────────────
    function getConvName(conv: any): string {
      if (!conv) return ''
      if (conv.type === 'group') return conv.name || 'Group Chat'
      const other = conv.other_user
      return other?.full_name || other?.username || 'User'
    }
    function getConvInitials(conv: any): string {
      return getConvName(conv).trim().split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
    }
    function getConvColor(conv: any): string {
      const name = getConvName(conv) || 'A'
      return COLORS[name.charCodeAt(0) % COLORS.length]
    }
    function getConvAvatar(conv: any): string | null {
      if (!conv) return null
      if (conv.type === 'direct' && conv.other_user?.avatar_url) return conv.other_user.avatar_url
      return null
    }
    function getSenderColor(senderId: string): string {
      return COLORS[senderId.charCodeAt(0) % COLORS.length]
    }
    function getInitials(name: string): string {
      if (!name) return '?'
      return name.trim().split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    }
    function getColorFromName(name: string): string {
      if (!name) return COLORS[0]
      return COLORS[name.charCodeAt(0) % COLORS.length]
    }
    function getAvatarSrc(url: string | null): string {
      if (!url) return ''
      if (url.startsWith('data:'))    return url
      if (url.startsWith('http'))     return url
      if (url.startsWith('/uploads')) return `${API_URL}${url}`
      return url
    }

    function formatTime(dateStr: string): string {
      if (!dateStr) return ''
      const diff  = Date.now() - new Date(dateStr).getTime()
      const mins  = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days  = Math.floor(hours / 24)
      if (mins < 1)   return 'now'
      if (mins < 60)  return `${mins}m`
      if (hours < 24) return `${hours}h`
      return `${days}d`
    }
    function formatMsgTime(dateStr: string): string {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const filteredContacts = computed(() =>
      conversations.value.filter(c =>
        getConvName(c).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    )
    const groupedMessages = computed(() => {
      const groups: Record<string, any[]> = {}
      messages.value.forEach(m => {
        const date = new Date(m.created_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric'
        })
        if (!groups[date]) groups[date] = []
        groups[date].push(m)
      })
      return groups
    })
    async function scrollToBottom() {
      await nextTick()
      if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
    watch(() => messages.value.length, scrollToBottom)

    return {
      loggedInUser, conversations, messages, activeConv,
      newMessage, searchQuery, showSidebar, messagesEl,
      convsLoading, msgsLoading, sending, isTyping,
      showNewChat, newChatType, newGroupName,
      searchUserInput, searchResults, selectedUsers, searchingUsers,
      newChatError, creating,
      filteredContacts, groupedMessages,
      getConvName, getConvInitials, getConvColor, getConvAvatar,
      getSenderColor, getInitials, getColorFromName, getAvatarSrc,
      formatTime, formatMsgTime,
      selectConversation, sendMessage,
      startConversation, closeNewChat, searchUsers, toggleSelectUser,
    }
  },
})
</script>

<style scoped>
.chat-page { height: calc(100vh - 64px); background: #F5F3EE; display: flex; flex-direction: column; }
.chat-layout { display: flex; flex: 1; overflow: hidden; max-width: 1200px; width: 100%; margin: 24px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); background: #fff; }

/* Sidebar */
.sidebar { width: 280px; flex-shrink: 0; border-right: 1px solid #E0DDD6; display: flex; flex-direction: column; background: #F5F3EE; }
.sidebar-header { padding: 16px 16px 12px; border-bottom: 1px solid #E0DDD6; }
.sidebar-title { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }
.search-wrap { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #E0DDD6; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; }
.search-input { border: none; outline: none; font-size: 13px; color: #1a1a1a; background: transparent; width: 100%; font-family: 'DM Sans', sans-serif; }
.new-chat-btn { width: 100%; padding: 8px; background: #1a2340; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.new-chat-btn:hover { background: #2D6A4F; }
.sidebar-loading { padding: 32px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #888; font-size: 13px; }
.contacts { flex: 1; overflow-y: auto; }
.contact { display: flex; align-items: center; gap: 10px; padding: 13px 16px; cursor: pointer; border-bottom: 1px solid #E0DDD6; transition: background 0.15s; }
.contact:hover { background: #fff; }
.contact.active { background: #fff; border-left: 3px solid #C8922A; }
.c-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; }
.c-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.c-info { flex: 1; min-width: 0; }
.c-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.c-preview { font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.c-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.c-time { font-size: 11px; color: #888; }
.c-badge { background: #C8922A; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
.no-contacts { padding: 32px 16px; text-align: center; font-size: 13px; color: #888; line-height: 1.8; }

/* Main */
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; text-align: center; }
.no-chat-icon  { font-size: 52px; }
.no-chat-title { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; }
.no-chat-sub   { font-size: 14px; color: #888; margin-bottom: 8px; }
.new-chat-big-btn { padding: 11px 28px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

/* Chat header */
.chat-header { padding: 14px 20px; border-bottom: 1px solid #E0DDD6; display: flex; align-items: center; gap: 12px; background: #fff; }
.back-btn { display: none; background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; }
.ch-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; }
.ch-info { flex: 1; }
.ch-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.ch-sub  { font-size: 12px; color: #888; margin-top: 1px; }

/* Messages */
.messages-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: #888; font-size: 13px; }
.messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 4px; background: #F5F3EE; }
.date-divider { text-align: center; font-size: 11px; color: #888; margin: 12px 0 8px; position: relative; }
.date-divider::before, .date-divider::after { content: ''; position: absolute; top: 50%; height: 1px; width: 38%; background: #E0DDD6; }
.date-divider::before { left: 0; } .date-divider::after { right: 0; }

/* ✅ Message rows */
.msg-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 2px; }
.msg-left  { flex-direction: row; }
.msg-right { flex-direction: row-reverse; }

/* ✅ Avatar only on LEFT side */
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; }
.msg-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

/* Message content */
.msg-content { display: flex; flex-direction: column; max-width: 65%; }
.msg-right .msg-content { align-items: flex-end; }
.msg-left  .msg-content { align-items: flex-start; }

/* Sender name — only left side, group only */
.msg-sender-name { font-size: 11px; font-weight: 600; color: #C8922A; margin-bottom: 3px; padding-left: 4px; }

/* Bubbles */
.bubble { padding: 9px 13px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; }
.bubble-theirs { background: #fff; color: #1a1a1a; border-bottom-left-radius: 4px; border: 1px solid #E0DDD6; }
.bubble-mine   { background: #1a2340; color: #fff; border-bottom-right-radius: 4px; }

/* ✅ Time + sent/seen status */
.msg-time { font-size: 10px; color: #aaa; margin-top: 3px; padding: 0 4px; display: flex; align-items: center; gap: 3px; }
.time-right { justify-content: flex-end; }
.msg-status { font-size: 11px; color: #C8922A; }

/* Typing */
.typing-bubble { display: flex; align-items: center; gap: 4px; padding: 10px 14px; min-width: 52px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #888; animation: bounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; } .dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-5px) } }

/* Input */
.input-area { padding: 12px 16px; border-top: 1px solid #E0DDD6; display: flex; gap: 10px; background: #fff; }
.msg-input { flex: 1; background: #F5F3EE; border: 1px solid #E0DDD6; border-radius: 20px; padding: 10px 16px; font-size: 13px; color: #1a1a1a; outline: none; font-family: 'DM Sans', sans-serif; }
.msg-input:focus { border-color: #1a2340; }
.send-btn { width: 38px; height: 38px; border-radius: 50%; background: #C8922A; border: none; cursor: pointer; font-size: 16px; color: #fff; flex-shrink: 0; }
.send-btn:hover:not(:disabled) { background: #a8771f; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Spinner */
.spinner { width: 18px; height: 18px; border: 2px solid #E0DDD6; border-top-color: #2D6A4F; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #fff; border-radius: 16px; padding: 28px; max-width: 400px; width: 90%; max-height: 85vh; overflow-y: auto; }
.modal-title { font-family: 'Cinzel', serif; font-size: 18px; color: #1a1a1a; margin-bottom: 16px; }
.modal-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.modal-tabs button { flex: 1; padding: 8px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.modal-tabs button.active { background: #1a2340; color: #fff; border-color: #1a2340; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { padding: 10px 14px; border: 1.5px solid #E0DDD6; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #2D6A4F; }
.search-user-wrap { position: relative; }

/* Search results */
.search-results { border: 1px solid #E0DDD6; border-radius: 8px; overflow: hidden; margin-top: 4px; max-height: 200px; overflow-y: auto; }
.search-result-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #F5F3EE; }
.search-result-item:hover { background: #F5F3EE; }
.search-result-item.selected { background: #EAF3DE; }
.sr-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; }
.sr-info { flex: 1; min-width: 0; }
.sr-name  { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.sr-email { font-size: 11px; color: #888; }
.sr-check { color: #2D6A4F; font-weight: 700; font-size: 16px; }
.no-results { font-size: 12px; color: #888; padding: 8px 4px; }

/* Selected chips */
.selected-users { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.selected-chip { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #1a2340; color: #fff; border-radius: 20px; font-size: 12px; }
.selected-chip button { background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }

.form-error { font-size: 13px; color: #AE2012; margin-bottom: 12px; }
.modal-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { flex: 1; padding: 10px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-start  { flex: 1; padding: 10px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-start:disabled { opacity: 0.6; cursor: not-allowed; }

/* Not logged in */
.not-logged-in { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; }
.nli-icon  { font-size: 52px; }
.nli-title { font-family: 'Cinzel', serif; font-size: 22px; color: #1a1a1a; }
.btn-login-big { padding: 11px 28px; background: #2D6A4F; border-radius: 8px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 8px; display: inline-block; }

/* Mobile */
@media (max-width: 768px) {
  .chat-layout { margin: 0; border-radius: 0; }
  .sidebar { position: absolute; z-index: 10; width: 100%; height: 100%; display: none; background: #F5F3EE; }
  .sidebar.mobile-show { display: flex; }
  .back-btn { display: block; }
}
</style>