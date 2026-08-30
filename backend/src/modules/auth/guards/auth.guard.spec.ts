import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let sessionRepository: any;
  let userRepository: any;
  let jwtService: any;
  let dateProvider: any;
  let config: any;
  let mockContext: any;

  beforeEach(() => {
    sessionRepository = {
      findById: vi.fn(),
      touch: vi.fn(),
    };
    userRepository = { findById: vi.fn() };
    jwtService = { verifyAccessToken: vi.fn() };
    dateProvider = {
      now: vi.fn().mockReturnValue(new Date('2026-08-30T12:00:00Z')),
    };
    config = {
      get: vi.fn((key, defaultValue) => Promise.resolve(defaultValue)),
    };

    authGuard = new AuthGuard(
      sessionRepository,
      userRepository,
      jwtService,
      dateProvider,
      config,
    );

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
          headers: {},
        }),
      }),
    };
  });

  it('should return true for valid session cookie', async () => {
    const session = {
      id: 'session1',
      userId: 'user1',
      csrfToken: 'csrf',
      isRevoked: () => false,
      isExpired: () => false,
      lastActivityAt: new Date(),
    };
    sessionRepository.findById.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue({
      id: 'user1',
      isActive: true,
      email: { toValue: () => 'student@example.com' },
      firstName: 'Student',
      lastName: 'User',
      role: { getValue: () => 'STUDENT' },
      departmentId: 'dept1',
    });
    const request = { cookies: { imas_session: 'session1' }, headers: {} };
    mockContext.switchToHttp = () => ({ getRequest: () => request });

    const result = await authGuard.canActivate(mockContext as any);
    expect(result).toBe(true);
    expect(request).toHaveProperty('user');
    expect(request).toHaveProperty('session');
  });

  it('should throw UnauthorizedException when no credentials', async () => {
    const request = { cookies: {}, headers: {} };
    mockContext.switchToHttp = () => ({ getRequest: () => request });

    await expect(authGuard.canActivate(mockContext as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
