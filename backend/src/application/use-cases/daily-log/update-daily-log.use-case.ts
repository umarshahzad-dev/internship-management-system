import { Injectable } from '@nestjs/common';
import { DailyLog } from '../../../domain/entities/daily-log.entity';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface UpdateDailyLogInput {
  logId: string;
  logDate?: Date;
  content?: string;
  currentUserId: string;
}

export interface UpdateDailyLogResult {
  id: string;
  internshipId: string;
  logDate: string;
  content: string;
  updatedAt: string;
}

@Injectable()
export class UpdateDailyLogUseCase {
  constructor(
    private readonly dailyLogRepository: IDailyLogRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: UpdateDailyLogInput): Promise<UpdateDailyLogResult> {
    const log = await this.dailyLogRepository.findById(input.logId);
    if (!log) {
      throw new DomainException('NOT_FOUND', 'Daily log not found', 404);
    }

    const internship = await this.internshipRepository.findById(
      log.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== input.currentUserId) {
      throw new DomainException('FORBIDDEN', 'Only owner can update logs', 403);
    }

    if (internship.status !== InternshipStatus.ONGOING) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Logs can only be updated while internship is ongoing',
        409,
      );
    }

    const newLogDate = input.logDate ?? log.logDate;
    if (newLogDate < internship.startDate || newLogDate > internship.endDate) {
      throw new DomainException(
        'VALIDATION_ERROR',
        'Log date must be within internship start and end dates',
        400,
      );
    }

    const now = this.dateProvider.now();
    const updated = new DailyLog(
      log.id,
      log.internshipId,
      newLogDate,
      input.content ?? log.content,
      log.createdAt,
      now,
    );

    let saved: DailyLog;
    try {
      saved = await this.dailyLogRepository.update(updated);
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
