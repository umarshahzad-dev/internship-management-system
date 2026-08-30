import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { DomainException } from '../../../common/exceptions/domain.exception';

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let refreshTokenRepository: any;
  let userRepository: any;
  let sessionRepository: any;
  let tokenGenerator: any;
  let jwtService: any;
  let dateProvider: any;
  let config: any;

  beforeEach(() => {
    refreshTokenRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      revokeAllForUser: vi.fn(),
      deleteExpired: vi.fn(),
    };
    userRepository = { findById: vi.fn() };
    sessionRepository = {
      findById: vi.fn(),
      create: vi.fn().mockImplementation((s) => Promise.resolve(s)),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
      touch: vi.fn(),
      deleteExpired: vi.fn(),
    };
    tokenGenerator = {
      generateRandomToken: vi.fn().mockReturnValue('newrefresh'),
      generateCsrfToken: vi.fn().mockReturnValue('csrf'),
      generateSessionId: vi.fn(),
    };
    jwtService = {
      signAccessToken: vi.fn().mockResolvedValue('newaccesstoken'),
      verifyAccessToken: vi.fn(),
    };
    dateProvider = {
      now: vi.fn().mockReturnValue(new Date('2026-08-30T12:00:00Z')),
    };
    config = {
      get: vi.fn((key, defaultValue) => Promise.resolve(defaultValue)),
    };

    refreshTokenUseCase = new RefreshTokenUseCase(
      refreshTokenRepository,
      userRepository,
      sessionRepository,
      tokenGenerator,
      jwtService,
      dateProvider,
      config,
    );
  });

  it('should rotate token and return new tokens', async () => {
    const existingToken = new RefreshToken(
      'id1',
      'user1',
      'session1',
      'hash',
      new Date('2026-09-06T12:00:00Z'),
      null,
      null,
      new Date('2026-08-30T12:00:00Z'),
    );
    refreshTokenRepository.findByTokenHash.mockResolvedValue(existingToken);
    userRepository.findById.mockResolvedValue({
      id: 'user1',
      isActive: true,
      departmentId: null,
      role: { getValue: () => 'ADMIN' },
      email: { toValue: () => 'admin@example.com' },
      firstName: 'Admin',
      lastName: 'User',
    });
    sessionRepository.create.mockImplementation((s) => Promise.resolve(s));
    refreshTokenRepository.create.mockImplementation((t) => Promise.resolve(t));

    const result = await refreshTokenUseCase.execute({
      refreshToken: 'someplain',
    });

    expect(result.accessToken).toBe('newaccesstoken');
    expect(result.refreshToken).toBe('newrefresh');
    expect(refreshTokenRepository.update).toHaveBeenCalled();
    expect(sessionRepository.revoke).toHaveBeenCalledWith(
      'session1',
      expect.any(Date),
    );
  });

  it('should throw TOKEN_REUSE_DETECTED when token already rotated', async () => {
    const existingToken = new RefreshToken(
      'id1',
      'user1',
      'session1',
      'hash',
      new Date('2026-09-06T12:00:00Z'),
      new Date(), // rotated
      null,
      new Date('2026-08-30T12:00:00Z'),
    );
    refreshTokenRepository.findByTokenHash.mockResolvedValue(existingToken);

    await expect(
      refreshTokenUseCase.execute({ refreshToken: 'someplain' }),
    ).rejects.toMatchObject({ code: 'TOKEN_REUSE_DETECTED' });
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalled();
  });
});
