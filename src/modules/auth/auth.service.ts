import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    // hash password
    const hashed = await bcrypt.hash(dto.password, 10);

    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepo.create({
      email: dto.email,
      full_name: dto.full_name,
      password_hash: hashed,
      verification_code: code,
      is_verified: false,
    });

    await this.userRepo.save(user);

    await this.sendVerificationEmail(user.email, code);

    return {
      message: 'Registered successfully. Please verify your email.',
    };
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your account',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${code}</h1>
        <p>This code will expire soon.</p>
        `,
    });
  }

  async resend(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_code = code;
    await this.userRepo.save(user);
    await this.sendVerificationEmail(user.email, code);

    return {
      message: 'Verification code resent successfully',
    };
  }

  async login(dto: any) {
    console.log('LOGIN DTO:', dto);

    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    console.log('USER:', user);

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);

    if (!isMatch) {
      throw new Error('Invalid password');
    }

    if (!user.is_verified) {
      throw new Error('Please verify your email first');
    }

    return {
      message: 'Login success',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    };
  }

  async verify(email: string, code: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.verification_code !== code) {
      throw new Error('Invalid code');
    }

    user.is_verified = true;
    user.verification_code = null;

    await this.userRepo.save(user);

    return {
      message: 'Email verified successfully',
    };
  }
}
