import { describe, expect, it, vi } from 'vitest';
import { GetAdminDashboardSummaryUseCase } from './get-admin-dashboard-summary.use-case';

describe('GetAdminDashboardSummaryUseCase', () => {
  it('forwards an optional department scope for administrators', async () => {
    const summary = { term: { id: 'term-1', name: '2026-2027 Güz' }, kpis: { totalApplications: 12 } };
    const reports = { getAdminDashboardSummary: vi.fn().mockResolvedValue(summary) };

    await expect(new GetAdminDashboardSummaryUseCase(reports as never).execute('ADMIN', 'department-1')).resolves.toEqual(summary);
    expect(reports.getAdminDashboardSummary).toHaveBeenCalledWith('department-1');
  });

  it('rejects non-admin callers before touching the repository', async () => {
    const reports = { getAdminDashboardSummary: vi.fn() };
    const useCase = new GetAdminDashboardSummaryUseCase(reports as never);

    expect(() => useCase.execute('ACADEMIC')).toThrow('Only administrators can view global statistics');
    expect(reports.getAdminDashboardSummary).not.toHaveBeenCalled();
  });
});
