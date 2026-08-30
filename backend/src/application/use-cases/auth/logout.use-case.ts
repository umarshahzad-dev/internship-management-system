import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../ports/session.repository.port';
import { IRefreshTokenRepository } from '../../ports/refresh-token.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface LogoutInput {
  userId: string;
  sessionId: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    const now = this.dateProvider.now();
    await this.sessionRepository.revoke(input.sessionId, now);
    await this.refreshTokenRepository.revokeAllForUser(input.userId, now);
  }
}
