import { DomainException } from '../../../common/exceptions/domain.exception';
import { describe, expect, it, vi } from 'vitest';
import { ListAdminCompaniesUseCase } from './list-admin-companies.use-case';

describe('ListAdminCompaniesUseCase', () => {
  it('allows only administrators to access sensitive company projections', async () => {
    const reports = { getAdminCompanies: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 }) };
    await expect(new ListAdminCompaniesUseCase(reports as never).execute('ADMIN', { termActive: true })).resolves.toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
    expect(reports.getAdminCompanies).toHaveBeenCalledWith({ termActive: true });
  });

  it('rejects non-admin callers before repository access', () => {
    const reports = { getAdminCompanies: vi.fn() };
    expect(() => new ListAdminCompaniesUseCase(reports as never).execute('ACADEMIC', {})).toThrow(DomainException);
    expect(reports.getAdminCompanies).not.toHaveBeenCalled();
  });
});
