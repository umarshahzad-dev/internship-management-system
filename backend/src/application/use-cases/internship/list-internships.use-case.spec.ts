import { describe, expect, it, vi } from 'vitest';
import { ListInternshipsUseCase } from './list-internships.use-case';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

describe('ListInternshipsUseCase', () => {
  it('projects student and company display metadata for academic lists', async () => {
    const internshipRepository = {
      findAllByDepartment: vi.fn().mockResolvedValue([
        {
          id: 'internship-1', departmentId: 'department-1', studentId: 'student-1', companyId: 'company-1',
          status: InternshipStatus.PENDING_COMMISSION, startDate: new Date('2026-07-01'), endDate: new Date('2026-07-28'),
          locked: false, approvedAt: null, employerApprovalIp: null, employerApprovalTimestamp: null,
          commissionApprovalUserId: null, commissionApprovalTimestamp: null, employerLogsApprovedAt: null,
        },
      ]),
    };
    const userRepository = { findById: vi.fn().mockResolvedValue({ firstName: 'Ayşe', lastName: 'Yılmaz', studentNumber: '20260001' }) };
    const companyRepository = { findById: vi.fn().mockResolvedValue({ name: 'Anka Yazılım' }) };

    const result = await new ListInternshipsUseCase(
      internshipRepository as never,
      userRepository as never,
      companyRepository as never,
    ).execute({ role: 'ACADEMIC', userId: 'academic-1', departmentId: 'department-1' });

    expect(result[0]).toMatchObject({ studentName: 'Ayşe Yılmaz', studentNumber: '20260001', companyName: 'Anka Yazılım' });
  });
});
