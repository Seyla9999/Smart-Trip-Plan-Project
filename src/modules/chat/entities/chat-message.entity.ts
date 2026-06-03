import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'conversation_id' })
  conversationId: string

  @Column({ name: 'sender_id' })
  senderId: string

  @Column({ type: 'text', nullable: true })
  text: string

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}