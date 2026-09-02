import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DailyLog } from '../../../domain/entities/daily-log.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface CreateDailyLogInput {
  internshipId: string;
  logDate: Date;
  content: string;
  currentUserId: string;
}

export interface CreateDailyLogResult {
  id: string;
  internshipId: string;
  logDate: string;
  content: string;
  updatedAt: string;
}

@Injectable()
export class CreateDailyLogUseCase {
  constructor(
    private readonly dailyLogRepository: IDailyLogRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateDailyLogInput): Promise<CreateDailyLogResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== input.currentUserId) {
      throw new DomainException('FORBIDDEN', 'Only owner can create logs', 403);
    }

    if (internship.status !== InternshipStatus.ONGOING) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Logs can only be created while internship is ongoing',
        409,
      );
    }

    const logDate = input.logDate;
    if (logDate < internship.startDate || logDate > internship.endDate) {
      throw new DomainException(
        'VALIDATION_ERROR',
        'Log date must be within internship start and end dates',
        400,
      );
    }

    const now = this.dateProvider.now();
    const log = new DailyLog(
      randomUUID(),
      internship.id,
      logDate,
      input.content,
      now,
      now,
    );

    let saved: DailyLog;
    try {
      saved = await this.dailyLogRepository.create(log);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === '23505'
      ) {
        throw new DomainException(
          'CONFLICT',
          'A log already exists for this date',
          409,
        );
      }
      throw error;
    }

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      logDate: saved.logDate.toISOString().slice(0, 10),
      content: saved.content,
      updatedAt: saved.updatedAt.toISOString(),
    };
  }
}
