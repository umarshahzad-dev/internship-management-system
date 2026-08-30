import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { IUserRepository } from '../../ports/user.repository.port';
import { IPasswordResetTokenRepository } from '../../ports/password-reset-token.repository.port';
import { IEmailSender } from '../../ports/email-sender.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { IConfigProvider } from '../../ports/config-provider.port';

export interface PasswordResetRequestInput {
  email: string;
}

@Injectable()
export class PasswordResetRequestUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly emailSender: IEmailSender,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  async execute(input: PasswordResetRequestInput): Promise<void> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const now = this.dateProvider.now();
    const plainToken =
      randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');
    const lifetimeSeconds = await this.config.get<number>(
      'auth.password_reset_lifetime_seconds',
      3600,
    );
    const expiresAt = new Date(now.getTime() + lifetimeSeconds * 1000);

    const resetToken = new PasswordResetToken(
      randomUUID(),
      user.id,
      tokenHash,
      expiresAt,
      null,
      now,
    );
    await this.passwordResetTokenRepository.create(resetToken);

    const resetLink = `http://localhost:3000/reset-password?token=${plainToken}`;
    try {
      await this.emailSender.send({
        to: user.email.toValue(),
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });
    } catch {
      // outbox pattern will handle failures later
    }
  }
}
