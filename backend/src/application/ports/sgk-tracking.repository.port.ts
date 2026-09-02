import { SgkTracking } from '../../domain/entities/sgk-tracking.entity';

export abstract class ISgkTrackingRepository {
  abstract findById(id: string): Promise<SgkTracking | null>;
  abstract findByInternship(internshipId: string): Promise<SgkTracking | null>;
  abstract create(tracking: SgkTracking): Promise<SgkTracking>;
  abstract update(tracking: SgkTracking): Promise<SgkTracking>;
  abstract findAllByDepartment(departmentId: string): Promise<SgkTracking[]>;
}
