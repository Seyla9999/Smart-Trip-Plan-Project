import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Resend } from 'resend'

import { User } from '../users/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

interface PendingUser {
  email: string;
  full_name: string;
  password_hash: string;
  verification_code: string;
  is_verified: boolean;
}

@Injectable()
export class AuthService {

  private pendingUsers = new Map<string, PendingUser>();
  private resend: Resend | null = null;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.SMTP_PASS);
  }

  async register(dto: RegisterDto) {
    
    const hashed = await bcrypt.hash(dto.password, 10)

    const code = Math.floor(100000 + Math.random() * 900000).toString()

    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    })
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    this.pendingUsers.set(dto.email, {
      email: dto.email,
      full_name: dto.full_name,
      password_hash: hashed,
      verification_code: code,
      is_verified: false,
    });

    try {
      await this.sendVerificationEmail(dto.email, code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown email provider error';
      console.error('Failed to send verification email during registration:', errorMessage, err);
      throw new BadRequestException(
        `Registered account could not be verified because the email could not be sent: ${errorMessage}`,
      );
    }

    return {
      message: 'Registered successfully. Please verify your email.',
    };
  }

  async sendVerificationEmail(email: string, code: string) {
    const resendApiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;

    if (!resendApiKey) {
      throw new BadRequestException('Email provider is not configured. Set RESEND_API_KEY in .env.');
    }

    if (!this.resend) {
      this.resend = new Resend(resendApiKey);
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #2e7d32; text-align: center;">Welcome to តោះទៅ! Cambodia</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering with Smart Trip Plan. To complete your registration, please verify your email address by entering the code below:</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #1a2340;">${code}</h1>
        </div>
        
        <p style="font-size: 14px; color: #666;">This code is valid for the next 15 minutes. If you did not request this email, please ignore it.</p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Travel Cambodia <admin@travelcambodia.site>',
        to: email,
        subject: 'Verify your TravelCambodia account',
        html: emailHtml,
      });

      if (error) {
        const errorMessage = error.message || 'Resend returned an unknown error';
        console.error('Resend rejected verification email to', email, errorMessage, error);
        throw new BadRequestException(`Failed to send verification email: ${errorMessage}`);
      }

      console.log('Verification email queued for', email, 'message id:', data?.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown email provider error';
      console.error('Mailer error sending verification email to', email, errorMessage, err);
      throw new BadRequestException(`Failed to send verification email: ${errorMessage}`);
    }
  }

  async resendVerificationEmail(email: string) {
    const pendingUser = this.pendingUsers.get(email);
    if (!pendingUser) {
        throw new Error('No pending registration found for this email. Please register again.')
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    pendingUser.verification_code = code;
    this.pendingUsers.set(email, pendingUser);

    try {
      await this.sendVerificationEmail(email, code);
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      return {
        message: 'Failed to resend verification code. Please contact support.',
      };
    }

    return {
      message: 'Verification code resent successfully',
    };
  }

  async login(dto: LoginDto) {
    console.log('LOGIN DTO:', dto)

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

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user.id, email: user.email })

    return {
        message: 'Login success',
        token,
        user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        },
    }
  }

  // async verify(email: string, code: string) {
  //   const pendingUser = this.pendingUsers.get(email);
  //   if (!pendingUser) {
  //         throw new Error('Registration session expired or not found. Please register again.')
  //     }

  //     if (pendingUser.verification_code !== code) {
  //         throw new Error('Invalid code')
  //     }

  //   const newUser = this.userRepo.create({
  //       email: pendingUser.email,
  //       full_name: pendingUser.full_name,
  //       password_hash: pendingUser.password_hash,
  //       is_verified: true, 
  //       verification_code: '',
  //   });

  //   await this.userRepo.save(newUser);

  //   this.pendingUsers.delete(email);
  //   return {
  //       message: 'Email verified and account created successfully!',
  //   }
  // } 

  async verify(email: string, code: string) {
    const pendingUser = this.pendingUsers.get(email);

    if (!pendingUser) {
      throw new NotFoundException('Registration session expired or not found. Please register again.');
    }

    if (pendingUser.verification_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    const user = this.userRepo.create({
      email: pendingUser.email,
      full_name: pendingUser.full_name,
      password_hash: pendingUser.password_hash,
      is_verified: true,
      verification_code: null,
    });

    await this.userRepo.save(user);
    this.pendingUsers.delete(email);

    return { message: 'Email verified successfully' };
  }
}
