import { describe, expect, it, vi } from 'vitest';
import { GetEmployerEvaluationDailyLogsUseCase } from './get-employer-evaluation-daily-logs.use-case';

describe('GetEmployerEvaluationDailyLogsUseCase', () => {
  it('returns only dated log entries for the internship bound to a valid evaluation token', async () => {
    const validateEmployerTokenUseCase = {
      execute: vi.fn().mockResolvedValue({ internshipId: 'internship-1' }),
    };
    const dailyLogRepository = {
      findByInternship: vi.fn().mockResolvedValue([
        {
          logDate: new Date('2026-08-01T00:00:00.000Z'),
          content: 'Implemented the assigned module.',
        },
      ]),
    };
    const useCase = new GetEmployerEvaluationDailyLogsUseCase(
      validateEmployerTokenUseCase as any,
      dailyLogRepository as any,
    );

    await expect(useCase.execute('valid-evaluation-token')).resolves.toEqual([
      {
        logDate: '2026-08-01',
        content: 'Implemented the assigned module.',
      },
    ]);
    expect(validateEmployerTokenUseCase.execute).toHaveBeenCalledWith({
      plainToken: 'valid-evaluation-token',
    });
    expect(dailyLogRepository.findByInternship).toHaveBeenCalledWith(
      'internship-1',
    );
  });
});
