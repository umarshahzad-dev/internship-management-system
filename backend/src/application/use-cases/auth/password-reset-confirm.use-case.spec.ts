import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasswordResetConfirmUseCase } from './password-reset-confirm.use-case';
import { DomainException } from '../../../common/exceptions/domain.exception';

describe('PasswordResetConfirmUseCase', () => {
  let useCase: PasswordResetConfirmUseCase;
  let passwordResetTokenRepository: any;
  let userRepository: any;
  let passwordHasher: any;
  let sessionRepository: any;
  let refreshTokenRepository: any;
  let dateProvider: any;

  beforeEach(() => {
    passwordResetTokenRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteExpired: vi.fn(),
    };
    userRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue('newhash'),
      verify: vi.fn(),
    };
    sessionRepository = {
      revokeAllForUser: vi.fn(),
      revoke: vi.fn(),
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

    useCase = new PasswordResetConfirmUseCase(
      passwordResetTokenRepository,
      userRepository,
      passwordHasher,
      sessionRepository,
      refreshTokenRepository,
      dateProvider,
    );
  });

  it('should throw INVALID_OR_EXPIRED_TOKEN when token not found', async () => {
    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(null);
    await expect(
      useCase.execute({ token: 'invalid', newPassword: 'NewPass123' }),
    ).rejects.toMatchObject({ code: 'INVALID_OR_EXPIRED_TOKEN' });
  });

  it('should update password and revoke sessions on valid token', async () => {
    passwordResetTokenRepository.findByTokenHash.mockResolvedValue({
      isUsed: () => false,
      isExpired: () => false,
      userId: 'user1',
      markUsed: vi.fn(),
    });
    userRepository.findById.mockResolvedValue({
      id: 'user1',
      updatePasswordHash: vi.fn(),
      isActive: true,
    });
    await useCase.execute({ token: 'valid', newPassword: 'NewPass123' });

    expect(userRepository.update).toHaveBeenCalled();
    expect(sessionRepository.revokeAllForUser).toHaveBeenCalled();
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalled();
  });
});
