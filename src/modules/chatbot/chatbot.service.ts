import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  async chat(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim();

    // Fast-path for simple greetings
    if (['hi', 'hello', 'hey', 'yo'].includes(lowerMessage)) {
      return 'Hello! 👋 How can I help you plan your trip today?';
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: process.env.OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content: `
                You are Smart Trip Planner AI.

                Rules for Content:
                - Keep greetings under 20 words.
                - Keep normal answers under 100 words.
                - Only give detailed itineraries when the user explicitly asks for one.
                - Focus on travel in Cambodia.
                - Be friendly, concise, and helpful.
                - If the user says "hi", "hello", or "hey", reply with a short greeting and ask how you can help.

                Rules for Formatting (STRICT):
                - ALWAYS use Markdown formatting to make your responses easy to read.
                - Use bullet points (-) or numbered lists (1., 2.) whenever you are suggesting multiple places, tips, or steps.
                - Use **bold text** for important keywords, locations, hotel names, or emphasis.
                - Separate different thoughts with line breaks. Avoid long, blocky paragraphs.
              `,
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
        response.data?.choices?.[0]?.message?.content || 'No response from AI.'
      );
    } catch (error) {
      console.error(error.response?.data || error);

      throw new InternalServerErrorException('Failed to get response from AI.');
    }
  }
}