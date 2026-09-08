import { describe, expect, it, vi } from 'vitest';
import { CreateDailyLogUseCase } from './create-daily-log.use-case';
import { UpdateDailyLogUseCase } from './update-daily-log.use-case';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

describe('daily-log completion lock', () => {
  const lockedStatuses = [
    InternshipStatus.EVALUATION,
    InternshipStatus.GRADED,
    InternshipStatus.COMPLETED,
  ];

  const lockedInternship = (status: InternshipStatus) => ({
    id: 'internship-1',
    studentId: 'student-1',
    status,
    startDate: new Date('2026-08-01T00:00:00.000Z'),
    endDate: new Date('2026-08-31T00:00:00.000Z'),
  });

  it.each(lockedStatuses)('rejects creating a log after %s', async (status) => {
    const dailyLogRepository = { create: vi.fn() };
    const internshipRepository = { findById: vi.fn().mockResolvedValue(lockedInternship(status)) };
    const useCase = new CreateDailyLogUseCase(
      dailyLogRepository as any,
      internshipRepository as any,
      { now: vi.fn() } as any,
    );

    await expect(
      useCase.execute({
        internshipId: 'internship-1',
        currentUserId: 'student-1',
        logDate: new Date('2026-08-15T00:00:00.000Z'),
        content: 'Completed the required work for the day.',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION', statusCode: 409 });
  });

  it.each(lockedStatuses)('rejects editing a log after %s', async (status) => {
    const dailyLogRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'log-1',
        internshipId: 'internship-1',
        logDate: new Date('2026-08-15T00:00:00.000Z'),
        content: 'Old content',
        createdAt: new Date('2026-08-15T00:00:00.000Z'),
      }),
    };
    const internshipRepository = { findById: vi.fn().mockResolvedValue(lockedInternship(status)) };
    const useCase = new UpdateDailyLogUseCase(
      dailyLogRepository as any,
      internshipRepository as any,
      { now: vi.fn() } as any,
    );

    await expect(
      useCase.execute({
        logId: 'log-1',
        currentUserId: 'student-1',
        content: 'Attempted edit after completion.',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION', statusCode: 409 });
  });
});
