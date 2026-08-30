import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasswordResetRequestUseCase } from './password-reset-request.use-case';

describe('PasswordResetRequestUseCase', () => {
  let useCase: PasswordResetRequestUseCase;
  let userRepository: any;
  let passwordResetTokenRepository: any;
  let emailSender: any;
  let dateProvider: any;
  let config: any;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    passwordResetTokenRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteExpired: vi.fn(),
    };
    emailSender = { send: vi.fn().mockResolvedValue(undefined) };
    dateProvider = { now: vi.fn().mockReturnValue(new Date()) };
    config = {
      get: vi.fn((key, defaultValue) => Promise.resolve(defaultValue)),
      getOrThrow: vi.fn(),
    };

    useCase = new PasswordResetRequestUseCase(
      userRepository,
      passwordResetTokenRepository,
      emailSender,
      dateProvider,
      config,
    );
  });

  it('should not throw when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({ email: 'unknown@example.com' }),
    ).resolves.toBeUndefined();
    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
  });

  it('should create token and send email when user exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user1',
      email: { toValue: () => 'student@example.com' },
    });
    passwordResetTokenRepository.create.mockResolvedValue({});
    await useCase.execute({ email: 'student@example.com' });

    expect(passwordResetTokenRepository.create).toHaveBeenCalled();
    expect(emailSender.send).toHaveBeenCalled();
  });
});
