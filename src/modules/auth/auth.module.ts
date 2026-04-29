import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { User } from '../users/user.entity'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
<<<<<<< HEAD
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
=======
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],  
  providers: [AuthService],
>>>>>>> 62905b1 (Authentication, Email Verrification)
})
export class AuthModule {}