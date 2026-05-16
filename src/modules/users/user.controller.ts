import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('count')
  async count() {
    const count = await this.service.countAll()
    return { success: true, count }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findById(id)
    if (!user) return { success: false, message: 'User not found' }
    const { password_hash, verification_code, ...safe } = user as any
    return { success: true, data: safe }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('id') id: string,
    @Body() body: {
      full_name?:  string
      username?:   string
      bio?:        string
      avatar_url?: string
    },
  ) {
    try {
      const data = await this.service.updateProfile(id, body)
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() body: { current_password: string; new_password: string },
  ) {
    try {
      return await this.service.changePassword(
        id,
        body.current_password,
        body.new_password,
      )
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  @Post(':id/delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('id') id: string) {
    try {
      return await this.service.deleteAccount(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  @Get(':id/stories')
  @HttpCode(HttpStatus.OK)
  async getUserStories(@Param('id') id: string) {
    try {
      return await this.service.getUserStories(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }
}