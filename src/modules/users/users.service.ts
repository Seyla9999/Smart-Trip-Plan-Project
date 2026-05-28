import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

export type AdminUserRecord = Pick<
  User,
  | 'id'
  | 'email'
  | 'full_name'
  | 'username'
  | 'avatar_url'
  | 'bio'
  | 'role'
  | 'last_login'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'is_verified'
  | 'status'
>;

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

  async createWithPassword(data: Partial<User> & { email: string; password?: string }) {
    const { password, ...userData } = data;
    
    if (!userData.email) {
      throw new BadRequestException('Email is required');
    }

    const email = userData.email;
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.repo.create(userData);
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    } 
    // Default to active and verified for admin-created users
    user.status = 'active';
    user.is_verified = true;

    return this.repo.save(user);
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }

  save(user: User) {
    return this.repo.save(user)
  }

  async findAllForAdmin(): Promise<AdminUserRecord[]> {
    return this.repo.find({
      select: {
        id: true,
        email: true,
        full_name: true,
        username: true,
        avatar_url: true,
        bio: true,
        role: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        is_verified: true,
        status: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string): Promise<AdminUserRecord> {
    const normalizedStatus = status?.trim().toLowerCase();
    if (!['active', 'banned'].includes(normalizedStatus)) {
      throw new BadRequestException('Status must be either active or banned');
    }

    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = normalizedStatus;
    user.updated_at = new Date();
    await this.repo.save(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      is_verified: user.is_verified,
      status: user.status,
    };
  }

  async countAll(): Promise<number> {
    return this.repo.count();
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
  async getNotifications(userId: string) {
    const data = await this.repo.manager.query(
      `SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20`,
      [userId]
    )
    const unread = data.filter((n: any) => !n.is_read).length
    return { success: true, data, unread }
  }
  async searchUsers(q: string) {
    if (!q || q.length < 2) return { success: true, data: [] }
    const users = await this.repo.manager.query(`
      SELECT id, full_name, username, email, avatar_url, role
      FROM users
      WHERE deleted_at IS NULL
        AND (
          email ILIKE $1
          OR username ILIKE $1
          OR full_name ILIKE $1
        )
      LIMIT 10
    `, [`%${q}%`])
    return { success: true, data: users }
  }

  async markNotificationsRead(userId: string) {
    await this.repo.manager.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    )
    return { success: true }
  }
  
}