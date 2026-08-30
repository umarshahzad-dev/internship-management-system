import { IsEmail } from 'class-validator';

export class PasswordResetRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
