<template>
  <div class="members-panel">
    <!-- Header -->
    <div class="members-header">
      <h3 class="members-title">👥 Trip Members</h3>
      <span class="members-count">{{ members.length }}</span>
    </div>

    <!-- Members List -->
    <div class="members-list">
      <div v-for="member in members" :key="member.id" class="member-item">
        <div class="member-avatar" :style="{ background: getMemberColor(member.id) }">
          <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.name" class="member-avatar-img" />
          <span v-else class="member-initials">{{ getInitials(member.name) }}</span>
        </div>
        <div class="member-info">
          <div class="member-name">
            {{ member.name }}
            <span v-if="isCreator(member.id)" class="role-badge owner-badge">Owner</span>
            <span v-else class="role-badge member-badge">Member</span>
          </div>
          <div class="member-email">{{ member.email }}</div>
        </div>
        <div v-if="isCreator(member.id)" class="member-icon">👑</div>
      </div>
    </div>

    <!-- Join Group Chat Section -->
    <div class="group-chat-section">
      <button 
        v-if="!hasJoinedGroupChat && !isCurrentUserInTrip"
        @click="joinGroupChat"
        :disabled="isJoiningChat"
        class="btn-join-chat"
      >
        <span v-if="isJoiningChat" class="spinner-small"></span>
        <span v-else>💬</span>
        {{ isJoiningChat ? 'Joining...' : 'Join Group Chat' }}
      </button>

      <button 
        v-else
        @click="openGroupChat"
        class="btn-open-chat"
      >
        💬 Open Group Chat
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="members.length === 0" class="members-empty">
      <div class="empty-icon">👥</div>
      <p>No members yet</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface Member {
  id: string
  name: string
  email: string
  avatar_url?: string
  role?: 'owner' | 'member'
}

export default defineComponent({
  name: 'PlanMembers',
  props: {
    members: {
      type: Array as PropType<Member[]>,
      required: true,
    },
    tripId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
  },
  emits: ['joined-chat', 'open-chat'],
  data() {
    return {
      hasJoinedGroupChat: false,
      isJoiningChat: false,
    }
  },
  computed: {
    currentUserId(): string {
      const user = localStorage.getItem('user_data') || localStorage.getItem('currentUser')
      if (user) {
        try {
          const parsed = JSON.parse(user)
          return parsed.id || parsed.user_id || ''
        } catch {
          return ''
        }
      }
      return ''
    },
    isCurrentUserInTrip(): boolean {
      const currentId = this.currentUserId
      if (!currentId) return false
      return this.members.some(member => String(member.id) === String(currentId)) || String(this.creatorId) === String(currentId)
    },
  },
  methods: {
    getInitials(name: string): string {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    getMemberColor(memberId: string): string {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      ]
      const hash = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return colors[hash % colors.length]
    },
    isCreator(memberId: string): boolean {
      return memberId === this.creatorId
    },
    async joinGroupChat() {
      this.isJoiningChat = true
      try {
        // Emit event to parent to handle joining the group chat
        this.$emit('joined-chat', {
          tripId: this.tripId,
          members: this.members,
        })
        this.hasJoinedGroupChat = true
      } catch (error) {
        console.error('Error joining group chat:', error)
      } finally {
        this.isJoiningChat = false
      }
    },
    openGroupChat() {
      this.$emit('open-chat', {
        tripId: this.tripId,
      })
    },
  },
})
</script>

<style scoped>
.members-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.members-title {
  font-size: 16px;
  font-weight: 700;
  color: #166534;
  margin: 0;
}

.members-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.members-list::-webkit-scrollbar {
  width: 6px;
}

.members-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.members-list::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.members-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f9fafb;
  transition: background-color 0.2s;
}

.member-item:hover {
  background: #f3f4f6;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.member-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-initials {
  font-size: 14px;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.creator-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.member-email {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 6px;
}

.owner-badge {
  background: #fef3c7;
  color: #92400e;
}

.member-badge {
  background: #dbeafe;
  color: #1e40af;
}

.member-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.group-chat-section {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.btn-join-chat,
.btn-open-chat {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-join-chat {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-join-chat:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-join-chat:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-open-chat {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-open-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.members-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.members-empty p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .members-panel {
    padding: 16px;
  }

  .members-title {
    font-size: 15px;
  }

  .member-item {
    padding: 8px;
    gap: 10px;
  }

  .member-avatar {
    width: 36px;
    height: 36px;
  }

  .member-name {
    font-size: 13px;
  }

  .btn-join-chat,
  .btn-open-chat {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>
