import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common'
import { ChatService } from './chat.service'

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('conversations')
  getConversations(@Query('userId') userId: string) {
    return this.service.getConversations(userId)
  }

  @Get('unread')
  getUnread(@Query('userId') userId: string) {
    return this.service.getTotalUnread(userId)
  }

  @Get('conversations/trip/:tripId')
  getTripConversation(
    @Param('tripId')    tripId:     string,
    @Query('createdBy') createdBy?: string,
    @Query('tripName')  tripName?:  string,
  ) {
    return this.service.getTripConversation(tripId, createdBy, tripName)
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @Query('userId') userId: string) {
    return this.service.getMessages(id, userId)
  }

  @Post('conversations')
  createConversation(@Body() body: {
    createdBy:  string
    type:       string
    name?:      string
    memberIds:  string[]
    tripId?:    string
  }) {
    return this.service.createConversation(body.createdBy, body)
  }

  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @Body() body: { senderId: string; text: string }) {
    return this.service.sendMessage(id, body.senderId, body.text)
  }

  @Post('conversations/:id/members')
  addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.addMember(id, body.userId)
  }

  @Put('conversations/:id/read')
  markRead(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.markRead(id, body.userId)
  }
}