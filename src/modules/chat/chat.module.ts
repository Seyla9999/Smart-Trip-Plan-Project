import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { Conversation } from './entities/conversation.entity'
import { ConversationMember } from './entities/conversation-member.entity'
import { ChatMessage } from './entities/chat-message.entity'
import { ConversationRead } from './entities/conversation-read.entity'

@Module({
  imports: [TypeOrmModule.forFeature([
    Conversation, ConversationMember, ChatMessage, ConversationRead,
  ])],
  controllers: [ChatController],
  providers:   [ChatService],
  exports:     [ChatService],
})
export class ChatModule {}