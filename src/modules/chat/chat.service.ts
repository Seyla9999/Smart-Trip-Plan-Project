import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversation }       from './entities/conversation.entity'
import { ConversationMember } from './entities/conversation-member.entity'
import { ChatMessage }        from './entities/chat-message.entity'
import { ConversationRead }   from './entities/conversation-read.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,

    @InjectRepository(ConversationMember)
    private memberRepo: Repository<ConversationMember>,

    @InjectRepository(ChatMessage)
    private msgRepo: Repository<ChatMessage>,

    @InjectRepository(ConversationRead)
    private readRepo: Repository<ConversationRead>,
  ) {}

  async getConversations(userId: string) {
    if (!userId) return { success: false, message: 'userId required' }
    const rows = await this.convRepo.manager.query(`
      SELECT
        c.id, c.type, c.name, c.avatar, c.trip_id, c.updated_at,
        (SELECT text FROM chat_messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM chat_messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM chat_messages cm
         WHERE cm.conversation_id = c.id AND cm.sender_id != $1
           AND cm.created_at > COALESCE(
             (SELECT last_read_at FROM conversation_reads WHERE conv_id = c.id AND uid = $1),
             '1970-01-01')) AS unread_count,
        (SELECT json_build_object(
           'id', u.id, 'full_name', u.full_name,
           'username', u.username, 'avatar_url', u.avatar_url)
         FROM conversation_members cm2
         JOIN users u ON u.id = cm2.user_id
         WHERE cm2.conversation_id = c.id AND cm2.user_id != $1
         LIMIT 1) AS other_user,
        (SELECT json_agg(json_build_object(
           'id', u.id, 'full_name', u.full_name, 'avatar_url', u.avatar_url))
         FROM conversation_members cm3
         JOIN users u ON u.id = cm3.user_id
         WHERE cm3.conversation_id = c.id) AS members
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = $1
      ORDER BY COALESCE(
        (SELECT created_at FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
        c.updated_at) DESC
    `, [userId])
    return { success: true, data: rows }
  }

  async getMessages(conversationId: string, userId: string) {
    const isMember = await this.memberRepo.findOne({ where: { conversationId, userId } })
    if (!isMember) return { success: false, message: 'Not a member' }
    const messages = await this.convRepo.manager.query(`
      SELECT m.id, m.text, m.created_at, m.sender_id,
             u.full_name AS sender_name, u.username AS sender_username, u.avatar_url AS sender_avatar
      FROM chat_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId])
    await this.markRead(conversationId, userId)
    return { success: true, data: messages }
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    if (!text?.trim()) return { success: false, message: 'Message cannot be empty' }
    const isMember = await this.memberRepo.findOne({ where: { conversationId, userId: senderId } })
    if (!isMember) return { success: false, message: 'Not a member' }
    const result = await this.convRepo.manager.query(`
      INSERT INTO chat_messages (conversation_id, sender_id, text)
      VALUES ($1, $2, $3) RETURNING id
    `, [conversationId, senderId, text.trim()])
    await this.convRepo.manager.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId])
    const msg = await this.convRepo.manager.query(`
      SELECT m.id, m.text, m.created_at, m.sender_id,
             u.full_name AS sender_name, u.avatar_url AS sender_avatar
      FROM chat_messages m JOIN users u ON u.id = m.sender_id
      WHERE m.id = $1
    `, [result[0].id])
    return { success: true, data: msg[0] }
  }

  async createConversation(createdBy: string, dto: { type: string; name?: string; memberIds: string[]; tripId?: string }) {
    if (dto.type === 'direct' && dto.memberIds.length === 1) {
      const existing = await this.convRepo.manager.query(`
        SELECT c.id FROM conversations c
        JOIN conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = $1
        JOIN conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = $2
        WHERE c.type = 'direct' LIMIT 1
      `, [createdBy, dto.memberIds[0]])
      if (existing.length > 0) return { success: true, data: { id: existing[0].id }, existing: true }
    }
    const convResult = await this.convRepo.manager.query(`
      INSERT INTO conversations (type, name, trip_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, name, trip_id, created_by, created_at, updated_at
    `, [dto.type, dto.name || null, dto.tripId || null, createdBy])
    const saved = convResult[0]
    await this.convRepo.manager.query(
      `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [saved.id, createdBy]
    )
    for (const uid of dto.memberIds) {
      if (uid && uid !== createdBy) {
        await this.convRepo.manager.query(
          `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [saved.id, uid]
        )
      }
    }
    return { success: true, data: saved }
  }

  async addMember(conversationId: string, userId: string) {
    await this.convRepo.manager.query(
      `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [conversationId, userId]
    )
    return { success: true, message: 'Member added' }
  }

  async markRead(conversationId: string, userId: string) {
    await this.convRepo.manager.query(`
      INSERT INTO conversation_reads (conv_id, uid, last_read_at) VALUES ($1, $2, NOW())
      ON CONFLICT (conv_id, uid) DO UPDATE SET last_read_at = NOW()
    `, [conversationId, userId])
    return { success: true }
  }

  async getTotalUnread(userId: string) {
    if (!userId) return { success: false, unread: 0 }
    const result = await this.convRepo.manager.query(`
      SELECT COUNT(*) AS total
      FROM chat_messages cm
      JOIN conversation_members memb ON memb.conversation_id = cm.conversation_id AND memb.user_id = $1
      WHERE cm.sender_id != $1
        AND cm.created_at > COALESCE(
          (SELECT last_read_at FROM conversation_reads WHERE conv_id = cm.conversation_id AND uid = $1),
          '1970-01-01')
    `, [userId])
    return { success: true, unread: parseInt(result[0]?.total || '0') }
  }

  async getTripConversation(tripId: string, createdBy?: string, tripName?: string) {
    const existing = await this.convRepo.findOne({ where: { tripId, type: 'group' } })
    if (existing) return { success: true, data: existing }
    if (!createdBy) return { success: false, message: 'createdBy required' }
    const result = await this.convRepo.manager.query(`
      INSERT INTO conversations (type, name, trip_id, created_by)
      VALUES ('group', $1, $2, $3)
      RETURNING id, type, name, trip_id, created_by, created_at
    `, [tripName || 'Trip Group Chat', tripId, createdBy])
    const saved = result[0]
    await this.convRepo.manager.query(
      `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [saved.id, createdBy]
    )
    return { success: true, data: saved }
  }
}