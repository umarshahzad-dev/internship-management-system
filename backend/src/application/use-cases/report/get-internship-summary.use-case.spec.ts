import { describe, expect, it, vi } from 'vitest';
import { GetInternshipSummaryUseCase } from './get-internship-summary.use-case';

describe('GetInternshipSummaryUseCase', () => {
  it('returns global counts only for administrators', async () => {
    const summary = { totalApplications: 10, pendingApplications: 4, completedApplications: 3 };
    const repository = { getInternshipSummary: vi.fn().mockResolvedValue(summary) };
    await expect(new GetInternshipSummaryUseCase(repository as never).execute('ADMIN')).resolves.toEqual(summary);
    expect(() => new GetInternshipSummaryUseCase(repository as never).execute('ACADEMIC')).toThrow('Only administrators can view global statistics');
  });
});
