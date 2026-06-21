<template>
  <div class="notif-page">
    <div class="notif-layout">
      <!-- Left: notification list -->
      <div class="notif-sidebar">
        <div class="notif-sidebar-header">
          <h2>Notifications</h2>
          <button v-if="unread > 0" class="mark-all-btn" @click="markAllRead">
            Mark all as read
          </button>
        </div>

        <div v-if="loading" class="notif-loading">
          <div class="spinner" />
        </div>

        <div v-else-if="notifications.length === 0" class="notif-empty-side">
          You have no notifications
        </div>

        <div v-else class="notif-list">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="notif-row"
            :class="{ unread: !n.is_read, active: selected?.id === n.id }"
            @click="selectNotif(n)"
          >
            <div class="notif-row-icon">{{ getIcon(n.type) }}</div>
            <div class="notif-row-body">
              <div class="notif-row-title">{{ n.title }}</div>
              <div class="notif-row-time">{{ formatTime(n.created_at) }}</div>
            </div>
            <div v-if="!n.is_read" class="unread-dot" />
          </div>
        </div>
      </div>

      <!-- Right: detail panel -->
      <div class="notif-detail">
        <div v-if="!selected" class="notif-detail-empty">
          <div class="detail-empty-icon">🔔</div>
          <p>Select from the list of notifications on the side to view more details</p>
        </div>

        <div v-else class="notif-detail-content">
          <div class="detail-icon">{{ getIcon(selected.type) }}</div>
          <h3 class="detail-title">{{ selected.title }}</h3>
          <p v-if="selected.message" class="detail-message">{{ selected.message }}</p>
          <p class="detail-time">{{ formatFullTime(selected.created_at) }}</p>

          <!-- Trip invite: show join button -->
          <div v-if="selected.type === 'trip_invite'">
            <p class="detail-hint">Someone joined your trip. View your trips to see the latest members.</p>
            <button class="detail-go-btn" @click="$router.push('/trip')">
              View My Trips →
            </button>
          </div>

          <!-- Chat notification -->
          <div v-else-if="selected.type === 'new_message'">
            <button class="detail-go-btn" @click="$router.push('/chat')">
              Go to Messages →
            </button>
          </div>

          <!-- Story notification -->
          <div v-else-if="selected.type === 'story_like' || selected.type === 'story_comment' || selected.type === 'story_status'">
            <button class="detail-go-btn" @click="$router.push('/community')">
              View Stories →
            </button>
          </div>

          <!-- Generic -->
          <div v-else-if="selected.link">
            <button class="detail-go-btn" @click="goToLink(selected)">
              View →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API from '@/api/axios'

export default defineComponent({
  name: 'NotificationsView',
  setup() {
    const router        = useRouter()
    const notifications = ref<any[]>([])
    const selected      = ref<any>(null)
    const loading       = ref(false)
    const unread        = ref(0)

    function getUser() {
      const raw = localStorage.getItem('user_data') || localStorage.getItem('user')
      try { return raw ? JSON.parse(raw) : null } catch { return null }
    }

    async function loadNotifications() {
      const user = getUser()
      if (!user?.id) return
      loading.value = true
      try {
        const res  = await API.get(`/users/${user.id}/notifications`)
        const data = res.data
        if (data.success) {
          notifications.value = data.data  || []
          unread.value        = data.unread || 0
        }
      } catch {}
      finally { loading.value = false }
    }

    async function selectNotif(n: any) {
      selected.value = n

      // Mark as read locally immediately
      if (!n.is_read) {
        n.is_read = true
        unread.value = Math.max(0, unread.value - 1)

        // Mark read on backend
        const user = getUser()
        if (user?.id) {
          try {
            await API.put(`/users/${user.id}/notifications/read`)
          } catch {}
        }
      }
    }

    async function markAllRead() {
      const user = getUser()
      if (!user?.id) return
      try {
        await API.put(`/users/${user.id}/notifications/read`)
        notifications.value = notifications.value.map(n => ({ ...n, is_read: true }))
        unread.value = 0
        // Dispatch event so NavBar badge updates too
        window.dispatchEvent(new Event('notifications-read'))
      } catch {}
    }

    function goToLink(n: any) {
      if (n.link) router.push(n.link)
    }

    function getIcon(type: string): string {
      const icons: Record<string, string> = {
        new_message:  '💬',
        story_like:   '❤️',
        story_comment:'💬',
        story_status: '📖',
        trip_invite:  '✈️',
        system:       '🔔',
      }
      return icons[type] || '🔔'
    }

    function formatTime(dateStr: string): string {
      if (!dateStr) return ''
      const diff  = Date.now() - new Date(dateStr).getTime()
      const mins  = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days  = Math.floor(hours / 24)
      if (mins  < 1)  return 'Just now'
      if (mins  < 60) return `${mins}m ago`
      if (hours < 24) return `${hours}h ago`
      return `${days}d ago`
    }

    function formatFullTime(dateStr: string): string {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    }

    onMounted(loadNotifications)

    return {
      notifications, selected, loading, unread,
      selectNotif, markAllRead, goToLink,
      getIcon, formatTime, formatFullTime,
    }
  },
})
</script>

<style scoped>
.notif-page {
  min-height: calc(100vh - 64px);
  background: #f5f3ee;
  padding: 32px 24px;
}

.notif-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
  min-height: 600px;
}

/* ── Left sidebar ─────────────────────────────────────────── */
.notif-sidebar {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #e0ddd6;
  display: flex;
  flex-direction: column;
}

.notif-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 14px;
  border-bottom: 1px solid #e0ddd6;
}

.notif-sidebar-header h2 {
  font-family: 'Cinzel', serif;
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}

.mark-all-btn {
  font-size: 11px;
  color: #c8922a;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.mark-all-btn:hover { text-decoration: underline; }

.notif-loading {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.spinner {
  width: 20px; height: 20px;
  border: 2px solid #e0ddd6;
  border-top-color: #c8922a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.notif-empty-side {
  padding: 32px 20px;
  font-size: 13px;
  color: #888;
}

.notif-list { flex: 1; overflow-y: auto; }

.notif-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f5f3ee;
  transition: background 0.15s;
  position: relative;
}
.notif-row:hover   { background: #faf8f5; }
.notif-row.active  { background: #f5f3ee; }
.notif-row.unread  { background: #fdfaf5; }

.notif-row-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }

.notif-row-body   { flex: 1; min-width: 0; }
.notif-row-title  { font-size: 13px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
.notif-row-time   { font-size: 11px; color: #c8922a; margin-top: 3px; }

.unread-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #c8922a;
  flex-shrink: 0;
  margin-top: 5px;
}

/* ── Right detail ─────────────────────────────────────────── */
.notif-detail {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-detail-empty {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 40px;
}

.detail-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }

.notif-detail-content {
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
}

.detail-icon    { font-size: 40px; margin-bottom: 16px; }
.detail-title   { font-family: 'Cinzel', serif; font-size: 20px; color: #1a1a1a; margin-bottom: 10px; }
.detail-message { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 12px; }
.detail-time    { font-size: 12px; color: #aaa; margin-bottom: 24px; }

.detail-go-btn {
  padding: 10px 24px;
  background: #1a2340;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.detail-go-btn:hover { background: #2d6a4f; }
.detail-hint { font-size: 13px; color: #888; margin-bottom: 12px; }

/* ── Mobile ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .notif-layout { flex-direction: column; }
  .notif-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e0ddd6; }
  .notif-detail { min-height: 300px; }
}
</style>