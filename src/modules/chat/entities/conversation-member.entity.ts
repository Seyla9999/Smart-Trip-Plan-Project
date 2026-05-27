import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('conversation_members')
export class ConversationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'conversation_id' })
  conversationId: string

  @Column({ name: 'user_id' })
  userId: string

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date
}