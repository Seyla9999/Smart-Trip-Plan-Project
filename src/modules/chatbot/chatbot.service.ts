import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  async chat(message: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: process.env.OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a travel assistant for Smart Trip Planner. Help users with travel recommendations.',
            },
            {
              role: 'user',
              content: message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return (
        response.data?.choices?.[0]?.message?.content ||
        'No response from AI.'
      );
    } catch (error) {
      console.error(error.response?.data || error);

      throw new InternalServerErrorException(
        'Failed to get response from AI.',
      );
    }
  }
}