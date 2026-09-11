import { AcademicCalendar } from '../../domain/entities/academic-calendar.entity';

export abstract class IAcademicCalendarRepository {
  abstract findById(id: string): Promise<AcademicCalendar | null>;
  abstract findByDepartment(): Promise<AcademicCalendar[]>;
  abstract findNextTerm(now: Date): Promise<AcademicCalendar | null>;
  abstract create(calendar: AcademicCalendar): Promise<AcademicCalendar>;
  abstract update(calendar: AcademicCalendar): Promise<AcademicCalendar>;
  abstract delete(id: string): Promise<void>;
}
