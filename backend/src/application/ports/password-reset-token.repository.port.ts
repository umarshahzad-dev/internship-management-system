import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export abstract class IPasswordResetTokenRepository {
  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null>;
  abstract create(token: PasswordResetToken): Promise<PasswordResetToken>;
  abstract update(token: PasswordResetToken): Promise<PasswordResetToken>;
  abstract deleteExpired(now: Date): Promise<void>;
}
