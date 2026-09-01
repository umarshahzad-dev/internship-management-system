import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AcademicCalendar } from '../../../domain/entities/academic-calendar.entity';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface CreateCalendarInput {
  departmentId: string;
  termName: string;
  applicationStart: Date;
  applicationEnd: Date;
  internshipStart: Date;
  internshipEnd: Date;
}

export interface CreateCalendarResult {
  id: string;
  departmentId: string;
  termName: string;
  applicationStart: string;
  applicationEnd: string;
  internshipStart: string;
  internshipEnd: string;
}

@Injectable()
export class CreateCalendarUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateCalendarInput): Promise<CreateCalendarResult> {
    const now = this.dateProvider.now();
    const calendar = new AcademicCalendar(
      randomUUID(),
      input.departmentId,
      input.termName,
      input.applicationStart,
      input.applicationEnd,
      input.internshipStart,
      input.internshipEnd,
      now,
      now,
    );

    const saved = await this.calendarRepository.create(calendar);
    return this.toResult(saved);
  }

  private toResult(calendar: AcademicCalendar): CreateCalendarResult {
    return {
      id: calendar.id,
      departmentId: calendar.departmentId,
      termName: calendar.termName,
      applicationStart: calendar.applicationStart.toISOString().slice(0, 10),
      applicationEnd: calendar.applicationEnd.toISOString().slice(0, 10),
      internshipStart: calendar.internshipStart.toISOString().slice(0, 10),
      internshipEnd: calendar.internshipEnd.toISOString().slice(0, 10),
    };
  }
}
