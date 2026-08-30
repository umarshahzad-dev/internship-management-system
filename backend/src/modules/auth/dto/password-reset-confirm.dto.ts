import { IsString, MinLength, Matches } from 'class-validator';

export class PasswordResetConfirmDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase, one lowercase, and one digit',
  })
  newPassword: string;
}
