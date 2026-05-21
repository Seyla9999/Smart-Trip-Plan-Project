import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { File as MulterFile } from 'multer'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { UsersService } from './users.service'

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

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findById(id)
    if (!user) return { success: false, message: 'User not found' }
    const { password_hash, verification_code, ...safe } = user as any
    return { success: true, data: safe }
  }

  @Get(':id/notifications')
  async getNotifications(@Param('id') id: string) {
    try {
      return await this.service.getNotifications(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  @Put(':id/notifications/read')
  async markAllRead(@Param('id') id: string) {
    try {
      return await this.service.markNotificationsRead(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  // GET /users/:id/stories
  @Get(':id/stories')
  @HttpCode(HttpStatus.OK)
  async getUserStories(@Param('id') id: string) {
    try {
      return await this.service.getUserStories(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  // PUT /users/:id — update profile
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

  @Post(':id/upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/avatars'
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase()
          cb(null, `${req.params.id}${ext}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith('image/')) {
          cb(null, true)
        } else {
          cb(new Error('Only image files are allowed'), false)
        }
      },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
  ) {
    try {
      if (!file) return { success: false, message: 'No file uploaded' }

      // Save URL path to database
      const avatarUrl = `/uploads/avatars/${file.filename}`
      await this.service.updateProfile(id, { avatar_url: avatarUrl })

      return { success: true, avatar_url: avatarUrl }
    } catch (e: any) {
      return { success: false, message: e.message }
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
      )
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }

  // POST /users/:id/delete-account
  @Post(':id/delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('id') id: string) {
    try {
      return await this.service.deleteAccount(id)
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  }
}
