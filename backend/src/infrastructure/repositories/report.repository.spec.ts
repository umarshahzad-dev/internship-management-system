import { parseAdminStatusFilter } from './report.repository';

describe('parseAdminStatusFilter', () => {
  it('accepts comma-separated workflow statuses and removes whitespace', () => {
    expect(parseAdminStatusFilter('ONGOING, ACTIVE')).toEqual(['ONGOING']);
  });

  it('returns a single status unchanged', () => {
    expect(parseAdminStatusFilter('PENDING_COMMISSION')).toEqual(['PENDING_COMMISSION']);
  });
});
