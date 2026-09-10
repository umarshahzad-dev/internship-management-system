import { describe, expect, it, vi } from 'vitest';
import { ApproveInternshipUseCase } from './approve-internship.use-case';
import { Internship } from '../../../domain/entities/internship.entity';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

describe('ApproveInternshipUseCase', () => {
  it('does not duplicate the automatic SGK queue when one already exists', async () => {
    const now = new Date('2026-01-01T09:00:00.000Z');
    const internship = new Internship(
      'internship-1',
      'department-1',
      'student-1',
      'company-1',
      InternshipStatus.PENDING_COMMISSION,
      new Date('2026-02-01'),
      new Date('2026-02-15'),
      {},
      false,
      null,
      null,
      now,
      now,
    );
    const sgk = {
      id: 'sgk-1',
      internshipId: internship.id,
      status: SgkStatus.PENDING,
      documentPath: null,
    };
    const internshipRepository = { findById: vi.fn().mockResolvedValue(internship), update: vi.fn() };
    const historyRepository = { create: vi.fn() };
    const documentRepository = { findAcceptedByInternship: vi.fn().mockResolvedValue([{ documentTypeId: 'required-1' }]) };
    const documentTypeRepository = { findByDepartment: vi.fn().mockResolvedValue([{ id: 'required-1', isRequired: true, source: 'EXTERNAL_UPLOAD', name: 'Kimlik' }]) };
    const sgkRepository = { findByInternship: vi.fn().mockResolvedValue(sgk), create: vi.fn() };
    const dateProvider = { now: vi.fn().mockReturnValue(now) };
    const useCase = new ApproveInternshipUseCase(
      internshipRepository as never,
      historyRepository as never,
      documentRepository as never,
      documentTypeRepository as never,
      sgkRepository as never,
      dateProvider as never,
    );

    await useCase.execute(internship.id, 'academic-1');

    expect(sgkRepository.findByInternship).toHaveBeenCalledWith(internship.id);
    expect(sgkRepository.create).not.toHaveBeenCalled();
  });
});
