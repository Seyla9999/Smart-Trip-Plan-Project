import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('count')
  async count() {
    const count = await this.service.countAll()
    return { success: true, count }
  }
}