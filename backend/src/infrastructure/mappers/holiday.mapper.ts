import { Holiday } from '../../domain/entities/holiday.entity';
import { HolidayEntity } from '../database/entities/holiday.entity';

export class HolidayMapper {
  static toDomain(entity: HolidayEntity): Holiday {
    return new Holiday(
      entity.id,
      entity.departmentId,
      new Date(entity.holidayDate),
      entity.name,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Holiday): HolidayEntity {
    const entity = new HolidayEntity();
    entity.id = domain.id;
    entity.departmentId = domain.departmentId;
    entity.holidayDate = domain.holidayDate;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
