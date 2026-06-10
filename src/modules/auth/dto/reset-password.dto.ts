import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(({ value, obj }: { value: unknown; obj: any }) => {
    if (typeof value === 'string') return value;
    if (typeof obj?.reset_token === 'string') return obj.reset_token;
    if (typeof obj?.token === 'string') return obj.token;
    return value;
  })
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @Transform(({ value, obj }: { value: unknown; obj: any }) => {
    if (typeof value === 'string') return value;
    if (typeof obj?.new_password === 'string') return obj.new_password;
    if (typeof obj?.password === 'string') return obj.password;
    return value;
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
