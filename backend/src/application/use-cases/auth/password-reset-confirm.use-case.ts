import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Password } from '../../../domain/value-objects/password.vo';
import { IPasswordResetTokenRepository } from '../../ports/password-reset-token.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { ISessionRepository } from '../../ports/session.repository.port';
import { IRefreshTokenRepository } from '../../ports/refresh-token.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface PasswordResetConfirmInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class PasswordResetConfirmUseCase {
  constructor(
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: PasswordResetConfirmInput): Promise<void> {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
    if (
      !resetToken ||
      resetToken.isUsed() ||
      resetToken.isExpired(this.dateProvider.now())
    ) {
      throw new DomainException(
        'INVALID_OR_EXPIRED_TOKEN',
        'Invalid or expired token',
        400,
      );
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new DomainException(
        'INVALID_OR_EXPIRED_TOKEN',
        'Invalid or expired token',
        400,
      );
    }

    const newPassword = new Password(input.newPassword);
    const newHash = await this.passwordHasher.hash(newPassword.toValue());

    user.updatePasswordHash(newHash);
    await this.userRepository.update(user);

    resetToken.markUsed(this.dateProvider.now());
    await this.passwordResetTokenRepository.update(resetToken);

    await this.sessionRepository.revokeAllForUser(
      user.id,
      this.dateProvider.now(),
    );
    await this.refreshTokenRepository.revokeAllForUser(
      user.id,
      this.dateProvider.now(),
    );
  }
}
