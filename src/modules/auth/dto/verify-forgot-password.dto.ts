import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyForgotPasswordDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(({ value, obj }: { value: unknown; obj: any }) => {
    if (typeof value === 'string') return value;
    if (typeof obj?.reset_code === 'string') return obj.reset_code;
    if (typeof obj?.otp === 'string') return obj.otp;
    return value;
  })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
