import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUseCase } from './login.use-case';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../domain/value-objects/role.vo';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: any;
  let securityStateRepository: any;
  let passwordHasher: any;
  let tokenGenerator: any;
  let jwtService: any;
  let sessionRepository: any;
  let refreshTokenRepository: any;
  let dateProvider: any;
  let config: any;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findByDepartment: vi.fn(),
    };
    securityStateRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };
    tokenGenerator = {
      generateRandomToken: vi.fn().mockReturnValue('randomtoken'),
      generateCsrfToken: vi.fn().mockReturnValue('csrf123'),
      generateSessionId: vi.fn().mockReturnValue('session123'),
    };
    jwtService = {
      signAccessToken: vi.fn().mockResolvedValue('accesstoken'),
      verifyAccessToken: vi.fn(),
    };
    sessionRepository = {
      findById: vi.fn(),
      create: vi.fn().mockImplementation((s) => Promise.resolve(s)),
      update: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
      touch: vi.fn(),
      deleteExpired: vi.fn(),
    };
    refreshTokenRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn().mockImplementation((t) => Promise.resolve(t)),
      update: vi.fn(),
      revokeAllForUser: vi.fn(),
      deleteExpired: vi.fn(),
    };
    dateProvider = {
      now: vi.fn().mockReturnValue(new Date('2026-08-30T12:00:00Z')),
    };
    config = {
      get: vi.fn((key, defaultValue) => Promise.resolve(defaultValue)),
      getOrThrow: vi.fn(),
    };

    loginUseCase = new LoginUseCase(
      userRepository,
      securityStateRepository,
      passwordHasher,
      tokenGenerator,
      jwtService,
      sessionRepository,
      refreshTokenRepository,
      dateProvider,
      config,
    );
  });

  it('should throw INVALID_CREDENTIALS when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'Test1234',
        isBrowser: true,
      }),
    ).rejects.toThrow(DomainException);
    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'Test1234',
        isBrowser: true,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('should return user and csrfToken for browser login', async () => {
    const user = {
      id: 'user1',
      departmentId: 'dept1',
      email: new Email('student@example.com'),
      passwordHash: 'hashed',
      role: { getValue: () => UserRole.STUDENT, isStudent: () => true },
      firstName: 'Student',
      lastName: 'User',
      studentNumber: '123',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      updateLastLogin: vi.fn(),
    };
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    securityStateRepository.findByUserId.mockResolvedValue(null);
    userRepository.update.mockResolvedValue(user);
    securityStateRepository.create.mockResolvedValue({});
    sessionRepository.create.mockImplementation((s) => Promise.resolve(s));

    const result = await loginUseCase.execute({
      email: 'student@example.com',
      password: 'Test1234',
      isBrowser: true,
    });

    expect(result.user.email).toBe('student@example.com');
    expect(result.csrfToken).toBe('csrf123');
    expect(result.sessionId).toBeDefined();
    expect(result.accessToken).toBeUndefined();
  });

  it('should return access and refresh tokens for non-browser login', async () => {
    const user = {
      id: 'user1',
      departmentId: null,
      email: new Email('admin@example.com'),
      passwordHash: 'hashed',
      role: { getValue: () => UserRole.ADMIN, isStudent: () => false },
      firstName: 'Admin',
      lastName: 'User',
      studentNumber: null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      updateLastLogin: vi.fn(),
    };
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    securityStateRepository.findByUserId.mockResolvedValue(null);
    userRepository.update.mockResolvedValue(user);
    securityStateRepository.create.mockResolvedValue({});
    sessionRepository.create.mockImplementation((s) => Promise.resolve(s));
    tokenGenerator.generateRandomToken.mockReturnValue('refreshplain');
    jwtService.signAccessToken.mockResolvedValue('accesstoken');
    refreshTokenRepository.create.mockImplementation((t) => Promise.resolve(t));

    const result = await loginUseCase.execute({
      email: 'admin@example.com',
      password: 'Test1234',
      isBrowser: false,
    });

    expect(result.accessToken).toBe('accesstoken');
    expect(result.refreshToken).toBe('refreshplain');
  });

  it('should throw ACCOUNT_LOCKED when locked', async () => {
    const user = {
      id: 'u1',
      isActive: true,
      email: new Email('x@y.com'),
      passwordHash: 'h',
    };
    userRepository.findByEmail.mockResolvedValue(user);
    securityStateRepository.findByUserId.mockResolvedValue({
      isLocked: vi.fn().mockReturnValue(true),
    });

    await expect(
      loginUseCase.execute({
        email: 'x@y.com',
        password: 'Test1234',
        isBrowser: true,
      }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED' });
  });
});
