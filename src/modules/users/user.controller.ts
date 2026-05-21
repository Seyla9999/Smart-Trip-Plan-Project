import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAllForAdmin();
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.service.createWithPassword(body);
    return { success: true, data };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const data = await this.service.updateStatus(id, body.status);
    return { success: true, data };
  }

  @Get('count')
  async count() {
    const count = await this.service.countAll();
    return { success: true, count };
  }
}
