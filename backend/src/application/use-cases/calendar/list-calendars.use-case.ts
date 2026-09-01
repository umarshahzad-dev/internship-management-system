import { Injectable } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';

@Injectable()
export class ListCalendarsUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
  ) {}

  async execute(departmentId: string) {
    const calendars =
      await this.calendarRepository.findByDepartment(departmentId);
    return calendars.map((calendar) => ({
      id: calendar.id,
      departmentId: calendar.departmentId,
      termName: calendar.termName,
      applicationStart: calendar.applicationStart.toISOString().slice(0, 10),
      applicationEnd: calendar.applicationEnd.toISOString().slice(0, 10),
      internshipStart: calendar.internshipStart.toISOString().slice(0, 10),
      internshipEnd: calendar.internshipEnd.toISOString().slice(0, 10),
    }));
  }
}
