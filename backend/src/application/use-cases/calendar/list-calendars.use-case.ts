import { Injectable } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';

export interface CalendarListItem {
  id: string;
  termName: string;
  applicationStart: string;
  applicationEnd: string;
  internshipStart: string;
  internshipEnd: string;
}

@Injectable()
export class ListCalendarsUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
  ) {}

  async execute(filters: { search?: string; year?: string; sortDir?: string } = {}): Promise<CalendarListItem[]> {
    const calendars = await this.calendarRepository.findByDepartment();
    const items = calendars.map((calendar) => ({
      id: calendar.id,
      termName: calendar.termName,
      applicationStart: calendar.applicationStart.toISOString().slice(0, 10),
      applicationEnd: calendar.applicationEnd.toISOString().slice(0, 10),
      internshipStart: calendar.internshipStart.toISOString().slice(0, 10),
      internshipEnd: calendar.internshipEnd.toISOString().slice(0, 10),
    }));
    const filtered = items.filter((item) => (!filters.search || item.termName.toLocaleLowerCase('tr-TR').includes(filters.search.toLocaleLowerCase('tr-TR'))) && (!filters.year || item.termName.startsWith(filters.year)));
    return filtered.sort((a, b) => { const result = a.internshipEnd.localeCompare(b.internshipEnd); return filters.sortDir === 'asc' ? result : -result });
  }
}
