import { AcademicCalendar } from '../../domain/entities/academic-calendar.entity';
import { AcademicCalendarEntity } from '../database/entities/academic-calendar.entity';

export class AcademicCalendarMapper {
  static toDomain(entity: AcademicCalendarEntity): AcademicCalendar {
    return new AcademicCalendar(
      entity.id,
      entity.departmentId,
      entity.termName,
      new Date(entity.applicationStart),
      new Date(entity.applicationEnd),
      new Date(entity.internshipStart),
      new Date(entity.internshipEnd),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: AcademicCalendar): AcademicCalendarEntity {
    const entity = new AcademicCalendarEntity();
    entity.id = domain.id;
    entity.departmentId = domain.departmentId;
    entity.termName = domain.termName;
    entity.applicationStart = domain.applicationStart;
    entity.applicationEnd = domain.applicationEnd;
    entity.internshipStart = domain.internshipStart;
    entity.internshipEnd = domain.internshipEnd;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
