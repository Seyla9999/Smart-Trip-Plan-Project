import { Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('conversation_reads')
export class ConversationRead {
  @PrimaryColumn({ name: 'conv_id' })
  convId: string

  @PrimaryColumn({ name: 'uid' })
  uid: string

  @UpdateDateColumn({ name: 'last_read_at', type: 'timestamptz' })
  lastReadAt: Date
}