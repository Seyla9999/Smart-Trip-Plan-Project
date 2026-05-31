import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UploadedFile, UseInterceptors, HttpCode, HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs   from 'fs'
import { ChatService } from './chat.service'

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Put('ping')
  @HttpCode(HttpStatus.OK)
  ping(@Body() body: { userId: string }) {
    return this.service.pingLastSeen(body.userId)
  }

  @Get('online-status/:userId')
  getOnlineStatus(@Param('userId') userId: string) {
    return this.service.getOnlineStatus(userId)
  }

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
  getMessages(
    @Param('id')          id:     string,
    @Query('userId') userId: string,
  ) {
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
  sendMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; text?: string; imageUrl?: string },
  ) {
    return this.service.sendMessage(id, body.senderId, body.text ?? '', body.imageUrl)
  }

  @Post('conversations/:id/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './uploads/chat'
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          cb(null, dir)
        },
        filename: (req, file, cb) => {
          const ext  = path.extname(file.originalname).toLowerCase()
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
          cb(null, name)
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          cb(null, true)
        } else {
          cb(new Error('Only image/video files are allowed'), false)
        }
      },
    }),
  )
  async uploadAndSend(
    @Param('id') conversationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { senderId: string; text?: string },
  ) {
    if (!file) return { success: false, message: 'No file uploaded' }
    const imageUrl = `/uploads/chat/${file.filename}`
    return this.service.sendMessage(
      conversationId,
      body.senderId,
      body.text ?? '',
      imageUrl,
    )
  }

  @Put('conversations/:id/messages/:messageId/status')
  @HttpCode(HttpStatus.OK)
  updateMessageStatus(
    @Param('messageId') messageId: string,
    @Body() body: { userId: string; status: 'delivered' | 'seen' },
  ) {
    return this.service.updateMessageStatus(messageId, body.userId, body.status)
  }

  @Put('conversations/:id/seen')
  @HttpCode(HttpStatus.OK)
  markSeen(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return this.service.markConversationSeen(id, body.userId)
  }


  @Post('conversations/:id/members')
  addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.addMember(id, body.userId)
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  deleteMessage(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ) {
    return this.service.deleteMessage(messageId, userId)
  }

  @Put('conversations/:id/read')
  markRead(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.markRead(id, body.userId)
  }
}