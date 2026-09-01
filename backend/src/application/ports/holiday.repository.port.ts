import { Holiday } from '../../domain/entities/holiday.entity';

export abstract class IHolidayRepository {
  abstract findById(id: string): Promise<Holiday | null>;
  abstract findAll(): Promise<Holiday[]>;
  abstract findByDepartment(departmentId: string): Promise<Holiday[]>;
  abstract create(holiday: Holiday): Promise<Holiday>;
  abstract update(holiday: Holiday): Promise<Holiday>;
  abstract delete(id: string): Promise<void>;
}
