import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SgkTracking } from '../../../domain/entities/sgk-tracking.entity';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface CreateSgkRecordInput {
  internshipId: string;
  userId: string;
  departmentId: string;
}

export interface CreateSgkRecordResult {
  id: string;
  internshipId: string;
  status: SgkStatus;
  documentPath: string | null;
}

@Injectable()
export class CreateSgkRecordUseCase {
  constructor(
    private readonly sgkTrackingRepository: ISgkTrackingRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateSgkRecordInput): Promise<CreateSgkRecordResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'User cannot manage SGK for other departments',
        403,
      );
    }

    const existing = await this.sgkTrackingRepository.findByInternship(
      input.internshipId,
    );
    if (existing) {
      return {
        id: existing.id,
        internshipId: existing.internshipId,
        status: existing.status,
        documentPath: existing.documentPath,
      };
    }

    const now = this.dateProvider.now();
    const tracking = new SgkTracking(
      randomUUID(),
      input.internshipId,
      SgkStatus.PENDING,
      null,
      now,
      now,
    );

    const saved = await this.sgkTrackingRepository.create(tracking);
    return {
      id: saved.id,
      internshipId: saved.internshipId,
      status: saved.status,
      documentPath: saved.documentPath,
    };
  }
}
