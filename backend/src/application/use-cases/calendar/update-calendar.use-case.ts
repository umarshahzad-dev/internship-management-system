import { Injectable } from '@nestjs/common';
import { AcademicCalendar } from '../../../domain/entities/academic-calendar.entity';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UpdateCalendarInput {
  calendarId: string;
  termName?: string;
  applicationStart?: Date;
  applicationEnd?: Date;
  internshipStart?: Date;
  internshipEnd?: Date;
}

export interface UpdateCalendarResult {
  id: string;
  departmentId: string;
  termName: string;
  applicationStart: string;
  applicationEnd: string;
  internshipStart: string;
  internshipEnd: string;
}

@Injectable()
export class UpdateCalendarUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: UpdateCalendarInput): Promise<UpdateCalendarResult> {
    const existing = await this.calendarRepository.findById(input.calendarId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Calendar not found', 404);
    }

    const now = this.dateProvider.now();
    const updated = new AcademicCalendar(
      existing.id,
      existing.departmentId,
      input.termName ?? existing.termName,
      input.applicationStart ?? existing.applicationStart,
      input.applicationEnd ?? existing.applicationEnd,
      input.internshipStart ?? existing.internshipStart,
      input.internshipEnd ?? existing.internshipEnd,
      existing.createdAt,
      now,
    );

    const saved = await this.calendarRepository.update(updated);
    return {
      id: saved.id,
      departmentId: saved.departmentId,
      termName: saved.termName,
      applicationStart: saved.applicationStart.toISOString().slice(0, 10),
      applicationEnd: saved.applicationEnd.toISOString().slice(0, 10),
      internshipStart: saved.internshipStart.toISOString().slice(0, 10),
      internshipEnd: saved.internshipEnd.toISOString().slice(0, 10),
    };
  }
}
