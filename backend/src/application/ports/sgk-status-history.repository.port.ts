import { SgkStatusHistory } from '../../domain/entities/sgk-status-history.entity';

export abstract class ISgkStatusHistoryRepository {
  abstract findBySgkTracking(
    sgkTrackingId: string,
  ): Promise<SgkStatusHistory[]>;
  abstract create(history: SgkStatusHistory): Promise<SgkStatusHistory>;
}
