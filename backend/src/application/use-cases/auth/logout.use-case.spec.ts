import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
  let sessionRepository: any;
  let refreshTokenRepository: any;
  let dateProvider: any;

  beforeEach(() => {
    sessionRepository = {
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      touch: vi.fn(),
      deleteExpired: vi.fn(),
    };
    refreshTokenRepository = {
      revokeAllForUser: vi.fn(),
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteExpired: vi.fn(),
    };
    dateProvider = { now: vi.fn().mockReturnValue(new Date()) };

    logoutUseCase = new LogoutUseCase(
      sessionRepository,
      refreshTokenRepository,
      dateProvider,
    );
  });

  it('should revoke session and all refresh tokens', async () => {
    await logoutUseCase.execute({ userId: 'user1', sessionId: 'session1' });

    expect(sessionRepository.revoke).toHaveBeenCalledWith(
      'session1',
      expect.any(Date),
    );
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(
      'user1',
      expect.any(Date),
    );
  });
});
