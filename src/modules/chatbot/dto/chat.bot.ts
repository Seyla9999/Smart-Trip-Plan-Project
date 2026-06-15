import { IsNotEmpty, IsString } from 'class-validator';

export class ChatBotDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}