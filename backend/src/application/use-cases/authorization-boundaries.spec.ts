import { describe, expect, it, vi } from 'vitest';
import { ListInternshipsUseCase } from './internship/list-internships.use-case';
import { GetInternshipUseCase } from './internship/get-internship.use-case';
import { ListApplicationDocumentsUseCase } from './application-document/list-application-documents.use-case';
import { ListDailyLogsUseCase } from './daily-log/list-daily-logs.use-case';
import { GetEmployerEvaluationUseCase } from './employer-evaluation/get-employer-evaluation.use-case';
import { GetFinalGradeUseCase } from './scoring/get-final-grade.use-case';
import { InternshipStatus } from '../../domain/enums/internship-status.enum';

const internship = {
  id: 'internship-1',
  studentId: 'student-1',
  departmentId: 'department-1',
  status: InternshipStatus.EVALUATION,
};

async function expectForbidden(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({ statusCode: 403 });
}

describe('authorization use-case boundaries', () => {
  it('defaults internship and document reads to denial for Admin and Administrative roles', async () => {
    const repository = { findAllByStudent: vi.fn(), findAllByDepartment: vi.fn(), findById: vi.fn().mockResolvedValue(internship) };
    await expectForbidden(new ListInternshipsUseCase(repository as never).execute({ role: 'ADMIN', userId: 'admin-1' }));
    await expectForbidden(new GetInternshipUseCase(repository as never).execute({ internshipId: internship.id, currentUserId: 'admin-1', currentUserRole: 'ADMIN', currentUserDepartmentId: null }));
    await expectForbidden(new ListApplicationDocumentsUseCase({ findLatestByInternship: vi.fn() } as never, repository as never).execute({ internshipId: internship.id, currentUserId: 'admin-staff-1', currentUserRole: 'ADMINISTRATIVE', currentUserDepartmentId: internship.departmentId }));
  });

  it('limits Academic daily-log review to evaluation and later', async () => {
    const repository = { findById: vi.fn().mockResolvedValue({ ...internship, status: InternshipStatus.ONGOING }) };
    await expectForbidden(new ListDailyLogsUseCase({ findByInternship: vi.fn() } as never, repository as never).execute({ internshipId: internship.id, currentUserId: 'academic-1', currentUserRole: 'ACADEMIC', currentUserDepartmentId: internship.departmentId }));
  });

  it('withholds employer evaluations and grades from Students before grading', async () => {
    const repository = { findById: vi.fn().mockResolvedValue(internship) };
    await expectForbidden(new GetEmployerEvaluationUseCase({ findByInternship: vi.fn() } as never, repository as never).execute({ internshipId: internship.id, currentUserId: internship.studentId, currentUserRole: 'STUDENT', currentUserDepartmentId: internship.departmentId }));
    await expectForbidden(new GetFinalGradeUseCase({ findByInternship: vi.fn() } as never, repository as never).execute({ internshipId: internship.id, currentUserId: internship.studentId, currentUserRole: 'STUDENT', currentUserDepartmentId: internship.departmentId }));
  });
});
