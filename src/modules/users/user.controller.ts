import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { UsersService } from './users.service'

type MulterFile = {
  filename: string
}

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // GET /users/count
  @Get('count')
  async count() {
    const count = await this.service.countAll()
    return { success: true, count }
  }

  @Get('search')
  async searchUsers(@Query('q') q: string) {
    return this.service.searchUsers(q)
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findById(id);
    if (!user) return { success: false, message: 'User not found' };
    const { password_hash, verification_code, ...safe } = user as any;
    return { success: true, data: safe };
  }

  // GET /users/:id/notifications
  @Get(':id/notifications')
  async getNotifications(@Param('id') id: string) {
    try {
      return await this.service.getNotifications(id);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // PUT /users/:id/notifications/read
  @Put(':id/notifications/read')
  async markAllRead(@Param('id') id: string) {
    try {
      return await this.service.markNotificationsRead(id);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // GET /users/:id/stories
  @Get(':id/stories')
  @HttpCode(HttpStatus.OK)
  async getUserStories(@Param('id') id: string) {
    try {
      return await this.service.getUserStories(id);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // PUT /users/:id — update profile
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('id') id: string,
    @Body()
    body: {
      full_name?: string;
      username?: string;
      bio?: string;
      avatar_url?: string;
    },
  ) {
    try {
      const data = await this.service.updateProfile(id, body);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // POST /users/:id/upload-avatar
  @Post(':id/upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/avatars';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${req.params.id}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) return { success: false, message: 'No file uploaded' }
      const avatarUrl = `/uploads/avatars/${file.filename}`
      await this.service.updateProfile(id, { avatar_url: avatarUrl })
      return { success: true, avatar_url: avatarUrl }
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // POST /users/:id/change-password
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
      );
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // POST /users/:id/delete-account
  @Post(':id/delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('id') id: string) {
    try {
      return await this.service.deleteAccount(id);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}