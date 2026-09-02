import { Injectable } from '@nestjs/common';
import { Internship } from '../../../domain/entities/internship.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface UpdateDraftInternshipInput {
  internshipId: string;
  currentUserId: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateDraftInternshipResult {
  id: string;
  departmentId: string;
  studentId: string;
  companyId: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  locked: boolean;
}

@Injectable()
export class UpdateDraftInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: UpdateDraftInternshipInput,
  ): Promise<UpdateDraftInternshipResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== input.currentUserId) {
      throw new DomainException('FORBIDDEN', 'Only owner can edit', 403);
    }

    if (internship.status !== InternshipStatus.DRAFT || internship.locked) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only draft internships can be edited',
        409,
      );
    }

    const now = this.dateProvider.now();
    const updated = new Internship(
      internship.id,
      internship.departmentId,
      internship.studentId,
      input.companyId ?? internship.companyId,
      internship.status,
      input.startDate ?? internship.startDate,
      input.endDate ?? internship.endDate,
      internship.gradingData,
      internship.locked,
      internship.approvedAt,
      internship.approvedBy,
      internship.createdAt,
      now,
    );

    const saved = await this.internshipRepository.update(updated);
    return {
      id: saved.id,
      departmentId: saved.departmentId,
      studentId: saved.studentId,
      companyId: saved.companyId,
      status: saved.status,
      startDate: saved.startDate.toISOString().slice(0, 10),
      endDate: saved.endDate.toISOString().slice(0, 10),
      locked: saved.locked,
    };
  }
}
