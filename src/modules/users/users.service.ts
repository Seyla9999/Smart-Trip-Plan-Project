import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } })
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }

  save(user: User) {
    return this.repo.save(user)
  }

  async countAll(): Promise<number> {
    return this.repo.count()
  }

  async updateProfile(id: string, data: {
    full_name?: string
    username?:  string
    bio?:       string
    avatar_url?: string
  }) {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    if (data.full_name  !== undefined) user.full_name  = data.full_name
    if (data.username   !== undefined) user.username   = data.username
    if (data.bio        !== undefined) user.bio        = data.bio
    if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url
    user.updated_at = new Date()

    const saved = await this.repo.save(user)
    const { password_hash, verification_code, ...safe } = saved as any
    return safe
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isMatch) throw new BadRequestException('Current password is incorrect')

    user.password_hash = await bcrypt.hash(newPassword, 10)
    user.updated_at    = new Date()
    await this.repo.save(user)
    return { success: true, message: 'Password updated successfully' }
  }

  async deleteAccount(id: string) {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    user.deleted_at = new Date()
    await this.repo.save(user)
    return { success: true, message: 'Account deleted' }
  }

  async getUserStories(id: string) {
    const stories = await this.repo.manager.query(
      `SELECT s.*, 
        COALESCE(
          json_agg(json_build_object('url', att.url, 'file_type', att.file_type))
          FILTER (WHERE att.id IS NOT NULL), '[]'
        ) AS attachments
       FROM stories s
       LEFT JOIN attachments att ON att.entity_id::uuid = s.id AND att.entity_type = 'story'
       WHERE s.user_id = $1 AND s.deleted_at IS NULL
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [id]
    )
    return { success: true, data: stories }
  }
}