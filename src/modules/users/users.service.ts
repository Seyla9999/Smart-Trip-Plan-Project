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
    return this.repo.findOne({ where: { email } });
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
    return this.repo.save(this.repo.create(data));
  }

  save(user: User) {
    return this.repo.save(user);
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
}
