import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface CreateDraftInternshipInput {
  studentId: string;
  departmentId: string;
  companyId: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateDraftInternshipResult {
  id: string;
  studentId: string;
  departmentId: string;
  companyId: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  locked: boolean;
}

@Injectable()
export class CreateDraftInternshipUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: CreateDraftInternshipInput,
  ): Promise<CreateDraftInternshipResult> {
    // Enforce no duplicate active internships
    const activeInternships =
      await this.internshipRepository.findActiveByStudent(input.studentId);
    if (activeInternships.length > 0) {
      throw new DomainException(
        'DUPLICATE_APPLICATION',
        'Student already has an active internship',
        409,
      );
    }

    const now = this.dateProvider.now();
    const internship = new Internship(
      randomUUID(),
      input.departmentId,
      input.studentId,
      input.companyId,
      InternshipStatus.DRAFT,
      input.startDate,
      input.endDate,
      {},
      false,
      null,
      null,
      now,
      now,
    );

    const saved = await this.internshipRepository.create(internship);
    return {
      id: saved.id,
      studentId: saved.studentId,
      departmentId: saved.departmentId,
      companyId: saved.companyId,
      status: saved.status,
      startDate: saved.startDate.toISOString().slice(0, 10),
      endDate: saved.endDate.toISOString().slice(0, 10),
      locked: saved.locked,
    };
  }
}
