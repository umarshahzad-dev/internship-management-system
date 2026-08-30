import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export interface IPasswordResetTokenRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  create(token: PasswordResetToken): Promise<PasswordResetToken>;
  update(token: PasswordResetToken): Promise<PasswordResetToken>;
  deleteExpired(now: Date): Promise<void>;
}
