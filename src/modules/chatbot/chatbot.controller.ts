import { Body, Controller, Post } from '@nestjs/common';

import { ChatbotService } from './chatbot.service';
import { ChatBotDto } from './dto/chat.bot';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() body: ChatBotDto) {
    const reply = await this.chatbotService.chat(body.message);

    return {
      success: true,
      reply,
    };
  }
}