import { DailyLog } from '../../domain/entities/daily-log.entity';

export abstract class IDailyLogRepository {
  abstract findById(id: string): Promise<DailyLog | null>;
  abstract findByInternship(internshipId: string): Promise<DailyLog[]>;
  abstract create(log: DailyLog): Promise<DailyLog>;
  abstract update(log: DailyLog): Promise<DailyLog>;
}
