<template>
  <div class="chat-page" v-if="loggedInUser">
    <div class="chat-layout">

      <div class="sidebar" :class="{ 'mobile-show': showSidebar }">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Messages</h2>
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
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
            <div class="c-avatar-wrap">
              <div class="c-avatar" :style="{ background: getConvColor(c) }">
                <img v-if="getConvAvatar(c)" :src="getAvatarSrc(getConvAvatar(c))" class="c-avatar-img" />
                <span v-else>{{ getConvInitials(c) }}</span>
              </div>
              <span v-if="isOnline(c.other_user?.last_seen)" class="online-dot"></span>
            </div>
            <div class="c-info">
              <div class="c-name">{{ getConvName(c) }}</div>
              <div class="c-preview">{{ getLastMessagePreview(c) }}</div>
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
          <div class="chat-header" @click="showContactProfile(activeConv)" style="cursor:pointer">
            <button class="back-btn" @click.stop="showSidebar = true">←</button>
            <div class="ch-avatar-wrap">
              <div class="ch-avatar" :style="{ background: getConvColor(activeConv) }">
                <img v-if="getConvAvatar(activeConv)" :src="getAvatarSrc(getConvAvatar(activeConv))" class="c-avatar-img" />
                <span v-else>{{ getConvInitials(activeConv) }}</span>
              </div>
              <span v-if="isOnline(activeConv.other_user?.last_seen)" class="online-dot"></span>
            </div>
            <div class="ch-info">
              <div class="ch-name">{{ getConvName(activeConv) }}</div>
              <div class="ch-sub">
                <span v-if="isOnline(activeConv.other_user?.last_seen)" class="online-label">Online</span>
                <span v-else-if="activeConv.type === 'group'">{{ activeConv.members?.length || 0 }} members</span>
                <span v-else-if="activeConv.other_user?.last_seen">{{ getLastSeenText(activeConv.other_user.last_seen) }}</span>
                <span v-else class="ch-sub-muted">Offline</span>
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

                <div v-if="msg.sender_id !== loggedInUser.id"
                     class="msg-avatar"
                     :style="{ background: getSenderColor(msg.sender_id) }"
                     @click="showSenderProfile(msg)"
                     title="View profile"
                     style="cursor:pointer">
                  <img v-if="msg.sender_avatar" :src="getAvatarSrc(msg.sender_avatar)" class="msg-avatar-img" />
                  <span v-else>{{ getInitials(msg.sender_name) }}</span>
                </div>

                <div class="msg-content" @contextmenu.prevent="showMsgMenu(msg, $event)">
                  <div v-if="msg.sender_id !== loggedInUser.id && activeConv.type === 'group'"
                       class="msg-sender-name"
                       @click="showSenderProfile(msg)"
                       style="cursor:pointer">
                    {{ msg.sender_name }}
                  </div>

                  <div v-if="msg.deleted || msg.status === 'deleted'" class="bubble"
                       :class="[msg.sender_id === loggedInUser.id ? 'bubble-mine' : 'bubble-theirs', 'bubble-deleted']">
                    <span class="deleted-text">Message deleted</span>
                  </div>

                  <div v-else-if="msg.image_url" class="bubble"
                       :class="msg.sender_id === loggedInUser.id ? 'bubble-mine' : 'bubble-theirs'">
                    <img :src="getAvatarSrc(msg.image_url)" class="msg-image" @click="openImage(msg.image_url)" />
                    <div v-if="msg.text" class="msg-image-caption">{{ msg.text }}</div>
                  </div>

                  <div v-else class="bubble"
                       :class="msg.sender_id === loggedInUser.id ? 'bubble-mine' : 'bubble-theirs'">
                    {{ msg.text }}
                  </div>

                  <div class="msg-time" :class="{ 'time-right': msg.sender_id === loggedInUser.id }">
                    {{ formatMsgTime(msg.created_at) }}

                    <span v-if="msg.sender_id === loggedInUser.id && !msg.deleted && msg.status !== 'deleted'" class="msg-ticks">

                      <svg v-if="msg.status !== 'seen'" class="tick" viewBox="0 0 16 11" fill="none">
                        <path d="M1.5 5.5L5.5 9.5L14.5 1.5" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>

                      <svg v-else class="tick double-tick" viewBox="0 0 22 11" fill="none">
                        <path d="M1.5 5.5L5.5 9.5L14.5 1.5" stroke="#53a6f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7.5 5.5L11.5 9.5L20.5 1.5" stroke="#53a6f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="isTyping" class="msg-row msg-left">
              <div class="msg-avatar" :style="{ background: getConvColor(activeConv) }">
                {{ getConvInitials(activeConv) }}
              </div>
              <div class="bubble bubble-theirs typing-bubble">
                <span class="dot"/><span class="dot"/><span class="dot"/>
              </div>
            </div>
          </div>

          <transition name="emoji-fade">
            <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
              <div class="emoji-cats">
                <button v-for="cat in emojiCategories" :key="cat.name"
                        class="emoji-cat-btn"
                        :class="{ active: activeEmojiCat === cat.name }"
                        @click="activeEmojiCat = cat.name">{{ cat.icon }}</button>
              </div>
              <div class="emoji-grid">
                <button v-for="emoji in currentEmojis" :key="emoji"
                        class="emoji-btn"
                        @click="insertEmoji(emoji)">{{ emoji }}</button>
              </div>
            </div>
          </transition>

          <div class="input-area" @click="showEmojiPicker = false">
            <label class="attach-btn" title="Send photo" @click.stop>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <input type="file" accept="image/*" class="file-input" @change="sendPhoto" />
            </label>

            <input v-model="newMessage" class="msg-input"
                   :placeholder="`Message ${getConvName(activeConv)}...`"
                   @keydown.enter="sendMessage"
                   @click.stop
                   :disabled="sending" />

            <button class="emoji-toggle-btn" @click.stop="showEmojiPicker = !showEmojiPicker" title="Emoji">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="3" stroke-linecap="round"/>
                <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </button>

            <button class="send-btn" @click="sendMessage"
                    :disabled="!newMessage.trim() || sending">
              {{ sending ? '⏳' : '➤' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="profilePopup" class="profile-popup-overlay" @click.self="profilePopup = null">
      <div class="profile-popup">
        <button class="popup-close" @click="profilePopup = null">✕</button>
        <div class="popup-avatar" :style="{ background: getColorFromName(profilePopup.name) }">
          <img v-if="profilePopup.avatar" :src="getAvatarSrc(profilePopup.avatar)" class="popup-avatar-img" />
          <span v-else>{{ getInitials(profilePopup.name) }}</span>
        </div>
        <div class="popup-name">{{ profilePopup.name }}</div>
        <div class="popup-username" v-if="profilePopup.username">@{{ profilePopup.username }}</div>
        <div class="popup-actions">
          <button class="popup-btn-primary" @click="goToProfile(profilePopup.id)">View Profile</button>
          <button class="popup-btn-secondary" @click="startDirectChat(profilePopup.id); profilePopup = null">Message</button>
        </div>
      </div>
    </div>

    <div v-if="msgMenu" class="msg-menu" :style="{ top: msgMenu.y + 'px', left: msgMenu.x + 'px' }" @click.stop>
      <button v-if="msgMenu.msg.sender_id === loggedInUser.id && !msgMenu.msg.deleted"
              class="msg-menu-item delete" @click="deleteMessage(msgMenu.msg)">Delete Message</button>
      <button class="msg-menu-item" @click="copyMessage(msgMenu.msg)">Copy</button>
      <button class="msg-menu-item cancel" @click="msgMenu = null">Cancel</button>
    </div>
    <div v-if="msgMenu" class="msg-menu-backdrop" @click="msgMenu = null" />

    <div v-if="viewingImage" class="image-viewer-overlay" @click="viewingImage = null">
      <img :src="viewingImage" class="image-viewer-img" />
    </div>

    <div v-if="showNewChat" class="modal-overlay" @click.self="showNewChat = false">
      <div class="modal">
        <div class="modal-title">New Conversation</div>
        <div class="modal-tabs">
          <button :class="{ active: newChatType === 'direct' }" @click="newChatType = 'direct'">Direct</button>
          <button :class="{ active: newChatType === 'group' }" @click="newChatType = 'group'">Group</button>
        </div>
        <div v-if="newChatType === 'group'" class="form-group">
          <label class="form-label">Group Name</label>
          <input v-model="newGroupName" class="form-input" placeholder="e.g. Siem Reap Trip" />
        </div>
        <div class="form-group">
          <label class="form-label">Search by Email or Name</label>
          <input v-model="searchUserInput" class="form-input"
                 placeholder="Enter email address..."
                 @input="searchUsers" />
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
import { useRouter, useRoute } from 'vue-router'
import API from '@/api/axios'

const COLORS  = ['#1D3557','#2D6A4F','#C8922A','#5C4B8A','#AE2012','#2196A6','#6B4C3B']

const EMOJI_CATEGORIES = [
  { name: 'smileys',  icon: '😊', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😍','🥰','😘','😋','😛','😝','😜','🤩','🥳','😏','😒','😔','😟','😢','😭','😤','😠','🤯','😳','🥺','😱','😨'] },
  { name: 'gestures', icon: '👋', emojis: ['👋','🤚','✋','🖖','👌','✌️','🤞','👍','👎','✊','👊','👏','🙌','🙏','💪','🤝','👈','👉','👆','👇','☝️'] },
  { name: 'nature',   icon: '🌿', emojis: ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐯','🦁','🐸','🌸','🌺','🌻','🌷','🌹','🌿','🍀','🌱','🌲','🌴','🌵','🍁','🍂','🍃'] },
  { name: 'travel',   icon: '✈️', emojis: ['✈️','🚀','🛸','🚁','⛵','🚤','🚢','🏖️','🏝️','🗺️','🧭','⛰️','🏔️','🌋','🏕️','🌉','🌃','🌆','🌇','🌄','🌅','🗽','🗼','🏰','🏯','🎠','🎡','🎢'] },
  { name: 'food',     icon: '🍜', emojis: ['🍚','🍛','🍜','🍝','🍲','🥘','🍱','🍣','🍗','🥩','🍳','🥞','🍞','🥗','🌮','🍔','🍟','🍕','🍦','🍩','🍪','🎂','🍰','🧁','🍫','🍷','🍸','🍹','☕','🍵','🧋'] },
  { name: 'symbols',  icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💞','💓','💗','💖','💘','💝','⭐','🌟','💫','⚡','🌈','🔥','💥','❄️','🌊','🎉','🎊','🎈','🎁','🏆','🥇'] },
]

const _deletedIds = new Set<string>()

export default defineComponent({
  name: 'ChatView',
  setup() {
    const router = useRouter()
    const route = useRoute()

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

    const profilePopup = ref<any>(null)
    const msgMenu      = ref<any>(null)
    const viewingImage = ref<string | null>(null)

    const showNewChat     = ref(false)
    const newChatType     = ref<'direct'|'group'>('direct')
    const newGroupName    = ref('')
    const searchUserInput = ref('')
    const searchResults   = ref<any[]>([])
    const selectedUsers   = ref<any[]>([])
    const searchingUsers  = ref(false)
    const newChatError    = ref('')
    const creating        = ref(false)

    const showEmojiPicker = ref(false)
    const activeEmojiCat  = ref('smileys')
    const emojiCategories = EMOJI_CATEGORIES
    const currentEmojis   = computed(() =>
      EMOJI_CATEGORIES.find(c => c.name === activeEmojiCat.value)?.emojis ?? []
    )

    const targetConvId = computed(() => String(route.query.convId || route.query.chatId || ''))
    function insertEmoji(emoji: string) {
      newMessage.value += emoji
    }

    let lastMsgCount = 0
    let lastConvData = ''
    let pollInterval: any = null
    let pingInterval: any = null
    let searchTimeout: any = null

    function getLastMessagePreview(conv: any): string {
      if (conv.last_message && conv.last_message.trim()) return conv.last_message
      if (conv.last_message_image) {
        const senderName = conv.last_message_sender_id === loggedInUser.value?.id
          ? 'You'
          : (getConvName(conv) || 'Someone')
        return `${senderName} sent a photo`
      }
      return 'No messages yet'
    }

    function getLastSeenText(lastSeen: string): string {
      if (!lastSeen) return 'Offline'
      const diffMs   = Date.now() - new Date(lastSeen).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1)   return 'Last seen just now'
      if (diffMins < 60)  return `Last seen ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
      const diffHrs = Math.floor(diffMins / 60)
      if (diffHrs < 24)   return `Last seen ${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`
      const diffDays = Math.floor(diffHrs / 24)
      if (diffDays === 1) return 'Last seen yesterday'
      return `Last seen ${diffDays} days ago`
    }

    function isOnline(lastSeen: string | null | undefined): boolean {
      if (!lastSeen) return false
      const diffMins = (Date.now() - new Date(lastSeen).getTime()) / 60000
      return diffMins < 5
    }

    async function pingLastSeen() {
      if (!loggedInUser.value?.id) return
      try {
        await API.put('/chat/ping', {
          userId: loggedInUser.value.id
        })
      } catch {}
    }

    onMounted(async () => {
      const raw = localStorage.getItem('user_data') || localStorage.getItem('user')
      if (raw) {
        try {
          loggedInUser.value = JSON.parse(raw)
          await loadConversations()
          if (targetConvId.value) {
            const conv = conversations.value.find((c: any) => String(c.id) === targetConvId.value)
            if (conv) {
              await selectConversation(conv)
            }
          }
          await pingLastSeen()
          pollInterval = setInterval(pollUpdates, 5000)
          pingInterval = setInterval(pingLastSeen, 30000)
        } catch { loggedInUser.value = null }
      }
    })

    watch([conversations, targetConvId], async ([newConvs, newTarget]) => {
      if (!newTarget) return
      const conv = newConvs.find((c: any) => String(c.id) === newTarget)
      if (conv && (!activeConv.value || String(activeConv.value.id) !== newTarget)) {
        await selectConversation(conv)
      }
    })

    onUnmounted(() => {
      if (pollInterval) clearInterval(pollInterval)
      if (pingInterval) clearInterval(pingInterval)
    })

    async function loadConversations() {
      if (!loggedInUser.value?.id) return
      convsLoading.value = true
      try {
        const res  = await API.get(`/chat/conversations?userId=${loggedInUser.value.id}`)
        const newData    = Array.isArray(res.data.data) ? res.data.data : []
        const newDataStr = JSON.stringify(newData)
        if (newDataStr !== lastConvData) {
          conversations.value = newData
          lastConvData = newDataStr
        }
      } catch { conversations.value = [] }
      finally { convsLoading.value = false }
    }

    async function pollUpdates() {
      if (!loggedInUser.value?.id) return
      try {
        const res  = await API.get(`/chat/conversations?userId=${loggedInUser.value.id}`)
        const newData    = Array.isArray(res.data.data) ? res.data.data : []
        const newDataStr = JSON.stringify(newData)
        if (newDataStr !== lastConvData) {
          conversations.value = newData
          lastConvData = newDataStr

          if (activeConv.value) {
            const updated = newData.find((c: any) => c.id === activeConv.value.id)
            if (updated) activeConv.value = updated
          }
        }
        if (activeConv.value) {
          const msgRes  = await API.get(`/chat/conversations/${activeConv.value.id}/messages?userId=${loggedInUser.value.id}&_=${Date.now()}`, {
            cache: 'no-store'
          })
          const newMsgs = Array.isArray(msgRes.data.data) ? msgRes.data.data : []

          const existingIds = new Set(messages.value.map((m: any) => m.id))
          const toAdd = newMsgs.filter((m: any) => !existingIds.has(m.id))
          if (toAdd.length > 0) {
            messages.value.push(...toAdd)
            scrollToBottom()
          }

          for (const inMsg of newMsgs) {
            const local = messages.value.find((m: any) => m.id === inMsg.id)
            if (local && !local.deleted && local.status !== 'deleted') {
              local.status = inMsg.status
            }
          }
        }
      } catch {}
    }

    async function loadMessages(convId: string) {
      msgsLoading.value = true; lastMsgCount = 0
      try {
        const res  = await API.get(
          `/chat/conversations/${convId}/messages?userId=${loggedInUser.value.id}&_=${Date.now()}`,
           cache: 'no-store' 
        )

        messages.value = (Array.isArray(res.data.data) ? res.data.data : []).map((m: any) => {
          const isDeleted = _deletedIds.has(m.id)
            || m.deleted === true
            || m.deleted === 'true'
            || m.status === 'deleted'
            || (m.text === null && !m.image_url)
            || (m.text === '' && !m.image_url)
          if (isDeleted) _deletedIds.add(m.id)
          return {
            ...m,
            deleted:   isDeleted,
            text:      isDeleted ? null : m.text,
            image_url: isDeleted ? null : m.image_url,
          }
        })
        lastMsgCount = messages.value.length

        await API.put(`/chat/conversations/${convId}/seen`, {
          userId: loggedInUser.value.id,
        }).catch(() => {})
        scrollToBottom()
      } catch { messages.value = [] }
      finally { msgsLoading.value = false }
    }

    async function selectConversation(conv: any) {
      activeConv.value  = conv
      showSidebar.value = false
      conv.unread_count = 0
      showEmojiPicker.value = false
      await loadMessages(conv.id)
    }

    async function sendMessage() {
      if (!newMessage.value.trim() || !activeConv.value || sending.value) return
      const text = newMessage.value.trim()
      newMessage.value      = ''
      showEmojiPicker.value = false
      sending.value         = true

      const optimistic = {
        id: 'temp-' + Date.now(), sender_id: loggedInUser.value.id,
        sender_name: loggedInUser.value.full_name, sender_avatar: loggedInUser.value.avatar_url,
        text, status: 'sent', created_at: new Date().toISOString(),
      }
      messages.value.push(optimistic)
      lastMsgCount = messages.value.length
      scrollToBottom()

      try {
        const res = await API.post(`/chat/conversations/${activeConv.value.id}/messages`, {
          senderId: loggedInUser.value.id, text
        })
        if (res.data.success) {
          const idx = messages.value.findIndex((m: any) => m.id === optimistic.id)
          if (idx !== -1) messages.value[idx] = { ...res.data.data, status: res.data.data.status || 'sent' }
          const conv = conversations.value.find((c: any) => c.id === activeConv.value.id)
          if (conv) { conv.last_message = text; conv.last_message_at = new Date().toISOString() }
          lastConvData = ''
        }
      } catch {}
      finally { sending.value = false }
    }

    async function sendPhoto(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !activeConv.value) return
      if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return }

      sending.value = true
      const tempId = 'temp-' + Date.now()

      // Wait for FileReader before uploading so optimistic message is always added first
      await new Promise<void>(resolve => {
        const reader = new FileReader()
        reader.onload = ev => {
          const optimistic = {
            id: tempId,
            sender_id: loggedInUser.value.id,
            sender_name: loggedInUser.value.full_name,
            sender_avatar: loggedInUser.value.avatar_url,
            text: '', image_url: ev.target?.result as string,
            status: 'sent', created_at: new Date().toISOString(),
          }
          messages.value.push(optimistic)
          lastMsgCount = messages.value.length
          scrollToBottom()
          resolve()
        }
        reader.readAsDataURL(file)
      })

      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('senderId', loggedInUser.value.id)
        const res = await API.post(`/chat/conversations/${activeConv.value.id}/upload`, fd)
        if (res.data.success) {
          // Use exact tempId match — safe when multiple images are sent in parallel
          const idx = messages.value.findIndex((m: any) => m.id === tempId)
          if (idx !== -1) messages.value[idx] = { ...res.data.data, status: res.data.data.status || 'sent' }
        }
      } catch {} finally {
        sending.value = false;
        (e.target as HTMLInputElement).value = ''
      }
    }

    async function deleteMessage(msg: any) {
      msgMenu.value = null
      const original = { ...msg }
      const idx = messages.value.findIndex((m: any) => m.id === msg.id)
      _deletedIds.add(msg.id)
      if (idx !== -1) messages.value[idx] = { ...messages.value[idx], deleted: true, status: 'deleted', text: null, image_url: null }
      try {
        const res  = await API.delete(`/chat/messages/${msg.id}?userId=${loggedInUser.value.id}`)
        console.log('Delete response:', res.data)
        if (!res.data.success) {
          console.error('Delete failed:', res.data.message)
          _deletedIds.delete(msg.id)
          if (idx !== -1) messages.value[idx] = original
        }
      } catch (e) {
        console.error('Delete error:', e)
        _deletedIds.delete(msg.id)
        if (idx !== -1) messages.value[idx] = original
      }
    }

    function copyMessage(msg: any) {
      if (msg.text) navigator.clipboard.writeText(msg.text)
      msgMenu.value = null
    }

    function showMsgMenu(msg: any, e: MouseEvent) {
      if (msg.deleted || msg.status === 'deleted') return
      msgMenu.value = {
        msg,
        x: Math.min(e.clientX, window.innerWidth - 160),
        y: Math.min(e.clientY, window.innerHeight - 120),
      }
    }

    function openImage(url: string) { viewingImage.value = getAvatarSrc(url) }

    function showContactProfile(conv: any) {
      if (!conv) return
      if (conv.type === 'direct' && conv.other_user) {
        profilePopup.value = {
          id:       conv.other_user.id,
          name:     conv.other_user.full_name || conv.other_user.username || 'User',
          username: conv.other_user.username,
          avatar:   conv.other_user.avatar_url,
        }
      }
    }

    function showSenderProfile(msg: any) {
      if (msg.sender_id === loggedInUser.value?.id) return
      profilePopup.value = {
        id:       msg.sender_id,
        name:     msg.sender_name || 'User',
        username: msg.sender_username,
        avatar:   msg.sender_avatar,
      }
    }

    function goToProfile(userId: string) {
      profilePopup.value = null
      router.push(`/profile/user/${userId}`)
    }

    async function startDirectChat(userId: string) {
      if (!loggedInUser.value?.id) return
      try {
        const res = await API.post('/chat/conversations', {
          createdBy: loggedInUser.value.id,
          type: 'direct',
          memberIds: [userId]
        })
        if (res.data.success) {
          lastConvData = ''
          await loadConversations()
          const conv = conversations.value.find((c: any) => c.id === res.data.id)
          if (conv) selectConversation(conv)
        }
      } catch {}
    }

    async function searchUsers() {
      const q = searchUserInput.value.trim()
      if (q.length < 2) { searchResults.value = []; return }
      if (searchTimeout) clearTimeout(searchTimeout)
      searchTimeout = setTimeout(async () => {
        searchingUsers.value = true
        try {
          const res  = await API.get(`/users/search?q=${encodeURIComponent(q)}`)

          searchResults.value = (Array.isArray(res.data) ? res.data : [])
            .filter((u: any) => u.id !== loggedInUser.value?.id)
        } catch { searchResults.value = [] }
        finally { searchingUsers.value = false }
      }, 400)
    }

    function toggleSelectUser(user: any) {
      const idx = selectedUsers.value.findIndex(u => u.id === user.id)
      if (idx !== -1) selectedUsers.value.splice(idx, 1)
      else {
        if (newChatType.value === 'direct') selectedUsers.value = [user]
        else selectedUsers.value.push(user)
      }
    }

    async function startConversation() {
      newChatError.value = ''
      if (selectedUsers.value.length === 0) { newChatError.value = 'Please select a user'; return }
      if (newChatType.value === 'group' && !newGroupName.value.trim()) { newChatError.value = 'Please enter a group name'; return }
      creating.value = true
      try {
        const res = await API.post('/chat/conversations', {
          createdBy: loggedInUser.value.id,
          type:      newChatType.value,
          name:      newChatType.value === 'group' ? newGroupName.value : undefined,
          memberIds: selectedUsers.value.map(u => u.id),
        })
        if (res.data.success) {
          closeNewChat(); lastConvData = ''
          await loadConversations()
          const newConv = conversations.value.find((c: any) => c.id === res.data.id)
          if (newConv) selectConversation(newConv)
        } else { newChatError.value = res.data.message || 'Failed to create' }
      } catch { newChatError.value = 'Network error. Please try again.' }
      finally { creating.value = false }
    }

    function closeNewChat() {
      showNewChat.value = false; newGroupName.value = ''
      searchUserInput.value = ''; searchResults.value = []
      selectedUsers.value = []; newChatError.value = ''
    }

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
      if (url.startsWith('/uploads')){
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return `${baseUrl}${url}`;
      }
      return url
    }
    function formatTime(dateStr: string): string {
      if (!dateStr) return ''
      const diff  = Date.now() - new Date(dateStr).getTime()
      const mins  = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days  = Math.floor(hours / 24)
      if (mins < 1) return 'now'
      if (mins < 60) return `${mins}m`
      if (hours < 24) return `${hours}h`
      return `${days}d`
    }
    function formatMsgTime(dateStr: string): string {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const filteredContacts = computed(() =>
      conversations.value.filter(c => getConvName(c).toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
    const groupedMessages = computed(() => {
      const groups: Record<string, any[]> = {}
      messages.value.forEach(m => {
        const date = new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
      profilePopup, msgMenu, viewingImage,
      showNewChat, newChatType, newGroupName,
      searchUserInput, searchResults, selectedUsers, searchingUsers,
      newChatError, creating,
      showEmojiPicker, activeEmojiCat, emojiCategories, currentEmojis,
      filteredContacts, groupedMessages,
      isOnline,
      insertEmoji,
      getConvName, getConvInitials, getConvColor, getConvAvatar,
      getSenderColor, getInitials, getColorFromName, getAvatarSrc,
      formatTime, formatMsgTime,
      getLastMessagePreview, getLastSeenText,
      selectConversation, sendMessage, sendPhoto,
      deleteMessage, copyMessage, showMsgMenu, openImage,
      showContactProfile, showSenderProfile, goToProfile, startDirectChat,
      startConversation, closeNewChat, searchUsers, toggleSelectUser,
    }
  },
})
</script>

<style scoped>

.chat-page { height: calc(100vh - 64px); background: #F5F3EE; display: flex; flex-direction: column; }
.chat-layout { display: flex; flex: 1; overflow: hidden; max-width: 1200px; width: 100%; margin: 24px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); background: #fff; }
.sidebar { width: 280px; flex-shrink: 0; border-right: 1px solid #E0DDD6; display: flex; flex-direction: column; background: #F5F3EE; }
.sidebar-header { padding: 16px 16px 12px; border-bottom: 1px solid #E0DDD6; }
.sidebar-title { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 10px; letter-spacing: 0.01em; }
.search-wrap { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #E0DDD6; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; }
.search-icon { width: 15px; height: 15px; flex-shrink: 0; color: #aaa; }
.search-input { border: none; outline: none; font-size: 13px; color: #1a1a1a; background: transparent; width: 100%; font-family: 'DM Sans', sans-serif; }
.new-chat-btn { width: 100%; padding: 8px; background: #1a2340; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.new-chat-btn:hover { background: #2D6A4F; }
.sidebar-loading { padding: 32px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #888; font-size: 13px; }
.contacts { flex: 1; overflow-y: auto; }
.contact { display: flex; align-items: center; gap: 10px; padding: 13px 16px; cursor: pointer; border-bottom: 1px solid #E0DDD6; transition: background 0.15s; }
.contact:hover { background: #fff; }
.contact.active { background: #fff; border-left: 3px solid #C8922A; }

.c-avatar-wrap { position: relative; flex-shrink: 0; }
.c-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; }
.c-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.online-dot { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; background: #22c55e; border-radius: 50%; border: 2px solid #fff; }

.c-info { flex: 1; min-width: 0; }
.c-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.c-preview { font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.c-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.c-time { font-size: 11px; color: #888; }
.c-badge { background: #C8922A; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
.no-contacts { padding: 32px 16px; text-align: center; font-size: 13px; color: #888; line-height: 1.8; }

.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; text-align: center; }
.no-chat-icon  { font-size: 52px; }
.no-chat-title { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; }
.no-chat-sub   { font-size: 14px; color: #888; margin-bottom: 8px; }
.new-chat-big-btn { padding: 11px 28px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.chat-header { padding: 14px 20px; border-bottom: 1px solid #E0DDD6; display: flex; align-items: center; gap: 12px; background: #fff; transition: background 0.15s; }
.chat-header:hover { background: #F5F3EE; }
.back-btn { display: none; background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; }
.ch-avatar-wrap { position: relative; flex-shrink: 0; }
.ch-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; }
.ch-info { flex: 1; }
.ch-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.ch-sub  { font-size: 12px; color: #888; margin-top: 1px; }
.online-label { color: #22c55e; font-weight: 500; }


.messages-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: #888; font-size: 13px; }
.messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 4px; background: #F5F3EE; }
.date-divider { text-align: center; font-size: 11px; color: #888; margin: 12px 0 8px; position: relative; }
.date-divider::before, .date-divider::after { content: ''; position: absolute; top: 50%; height: 1px; width: 38%; background: #E0DDD6; }
.date-divider::before { left: 0; } .date-divider::after { right: 0; }
.msg-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 2px; }
.msg-left  { flex-direction: row; }
.msg-right { flex-direction: row-reverse; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; transition: opacity 0.15s; }
.msg-avatar:hover { opacity: 0.8; }
.msg-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.msg-content { display: flex; flex-direction: column; max-width: 65%; }
.msg-right .msg-content { align-items: flex-end; }
.msg-left  .msg-content { align-items: flex-start; }
.msg-sender-name { font-size: 11px; font-weight: 600; color: #C8922A; margin-bottom: 3px; padding-left: 4px; }
.msg-sender-name:hover { text-decoration: underline; }
.bubble { padding: 9px 13px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; }
.bubble-theirs { background: #fff; color: #1a1a1a; border-bottom-left-radius: 4px; border: 1px solid #E0DDD6; }
.bubble-mine   { background: #1a2340; color: #fff; border-bottom-right-radius: 4px; }
.bubble-deleted { opacity: 0.5; font-style: italic; }
.deleted-text { color: #888; }
.msg-image { max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer; display: block; }
.msg-image-caption { font-size: 12px; margin-top: 4px; opacity: 0.8; }

.msg-time {
  font-size: 10px;
  color: #aaa;
  margin-top: 3px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.time-right { justify-content: flex-end; }
.msg-ticks { display: inline-flex; align-items: center; }
.tick { width: 14px; height: 10px; }
.double-tick { width: 20px; }


.typing-bubble { display: flex; align-items: center; gap: 4px; padding: 10px 14px; min-width: 52px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #888; animation: bounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; } .dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-5px) } }

.emoji-picker {
  position: absolute;
  bottom: 70px;
  left: 60px;
  width: 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border: 1px solid #E0DDD6;
  z-index: 100;
  overflow: hidden;
}
.emoji-cats { display: flex; gap: 2px; padding: 8px 8px 4px; border-bottom: 1px solid #F5F3EE; overflow-x: auto; }
.emoji-cats::-webkit-scrollbar { display: none; }
.emoji-cat-btn { flex-shrink: 0; width: 34px; height: 30px; border: none; background: transparent; border-radius: 6px; font-size: 16px; cursor: pointer; }
.emoji-cat-btn:hover, .emoji-cat-btn.active { background: #F5F3EE; }
.emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 6px; max-height: 180px; overflow-y: auto; }
.emoji-grid::-webkit-scrollbar { width: 4px; }
.emoji-grid::-webkit-scrollbar-thumb { background: #E0DDD6; border-radius: 4px; }
.emoji-btn { aspect-ratio: 1; border: none; background: transparent; font-size: 18px; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.emoji-btn:hover { background: #F5F3EE; transform: scale(1.2); }
.emoji-fade-enter-active, .emoji-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.emoji-fade-enter-from, .emoji-fade-leave-to { opacity: 0; transform: translateY(6px); }

.input-area { padding: 12px 16px; border-top: 1px solid #E0DDD6; display: flex; gap: 10px; background: #fff; align-items: center; position: relative; }
.attach-btn { width: 36px; height: 36px; border-radius: 50%; background: #F5F3EE; border: 1px solid #E0DDD6; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; color: #555; }
.attach-btn:hover { background: #E0DDD6; }
.file-input { display: none; }
.msg-input { flex: 1; background: #F5F3EE; border: 1px solid #E0DDD6; border-radius: 20px; padding: 10px 16px; font-size: 13px; color: #1a1a1a; outline: none; font-family: 'DM Sans', sans-serif; }
.msg-input:focus { border-color: #1a2340; }
.emoji-toggle-btn { width: 34px; height: 34px; border-radius: 50%; background: transparent; border: none; cursor: pointer; color: #888; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.emoji-toggle-btn:hover { color: #C8922A; background: #F5F3EE; }
.send-btn { width: 38px; height: 38px; border-radius: 50%; background: #C8922A; border: none; cursor: pointer; font-size: 16px; color: #fff; flex-shrink: 0; }
.send-btn:hover:not(:disabled) { background: #a8771f; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.profile-popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.profile-popup { background: #fff; border-radius: 20px; padding: 32px 28px; max-width: 300px; width: 90%; text-align: center; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,0.2); }
.popup-close { position: absolute; top: 14px; right: 14px; background: #F5F3EE; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.popup-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #fff; margin: 0 auto 12px; overflow: hidden; }
.popup-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.popup-name { font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.popup-username { font-size: 13px; color: #888; margin-bottom: 20px; }
.popup-actions { display: flex; gap: 10px; }
.popup-btn-primary   { flex: 1; padding: 10px; background: #1a2340; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.popup-btn-primary:hover { background: #2D6A4F; }
.popup-btn-secondary { flex: 1; padding: 10px; background: #F5F3EE; color: #1a1a1a; border: 1px solid #E0DDD6; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.popup-btn-secondary:hover { background: #E0DDD6; }

.msg-menu-backdrop { position: fixed; inset: 0; z-index: 998; }
.msg-menu { position: fixed; z-index: 999; background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); border: 1px solid #E0DDD6; overflow: hidden; min-width: 150px; }
.msg-menu-item { display: block; width: 100%; padding: 12px 16px; background: none; border: none; text-align: left; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
.msg-menu-item:hover { background: #F5F3EE; }
.msg-menu-item.delete { color: #AE2012; }
.msg-menu-item.cancel { color: #888; border-top: 1px solid #E0DDD6; }

.image-viewer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }
.image-viewer-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; object-fit: contain; }

.spinner { width: 18px; height: 18px; border: 2px solid #E0DDD6; border-top-color: #2D6A4F; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9998; }
.modal { background: #fff; border-radius: 16px; padding: 28px; max-width: 400px; width: 90%; max-height: 85vh; overflow-y: auto; }
.modal-title { font-family: 'Cinzel', serif; font-size: 18px; color: #1a1a1a; margin-bottom: 16px; }
.modal-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.modal-tabs button { flex: 1; padding: 8px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.modal-tabs button.active { background: #1a2340; color: #fff; border-color: #1a2340; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { padding: 10px 14px; border: 1.5px solid #E0DDD6; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #2D6A4F; }
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
.selected-users { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.selected-chip { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #1a2340; color: #fff; border-radius: 20px; font-size: 12px; }
.selected-chip button { background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }
.form-error { font-size: 13px; color: #AE2012; margin-bottom: 12px; }
.modal-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { flex: 1; padding: 10px; border: 1.5px solid #E0DDD6; border-radius: 8px; background: none; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-start  { flex: 1; padding: 10px; background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-start:disabled { opacity: 0.6; cursor: not-allowed; }
.not-logged-in { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; }
.nli-icon  { font-size: 52px; }
.nli-title { font-family: 'Cinzel', serif; font-size: 22px; color: #1a1a1a; }
.btn-login-big { padding: 11px 28px; background: #2D6A4F; border-radius: 8px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 8px; display: inline-block; }

@media (max-width: 768px) {
  .chat-layout { margin: 0; border-radius: 0; }
  .sidebar { position: absolute; z-index: 10; width: 100%; height: 100%; display: none; background: #F5F3EE; }
  .sidebar.mobile-show { display: flex; }
  .back-btn { display: block; }
  .emoji-picker { left: 8px; width: calc(100vw - 16px); }
}
</style>