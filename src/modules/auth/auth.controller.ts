import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  verify(@Body() body: { email: string; code: string }) {
    return this.authService.verify(body.email, body.code);
  }

  @Post('resend')
  resend(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  // @Post('demo-token')
  // demoToken() {
  //   return this.authService.generateDemoToken()
  // }
}
