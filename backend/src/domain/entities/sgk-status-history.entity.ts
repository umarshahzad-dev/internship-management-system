import { SgkStatus } from '../enums/sgk-status.enum';

export class SgkStatusHistory {
  private readonly _id: string;
  private readonly _sgkTrackingId: string;
  private readonly _fromStatus: SgkStatus;
  private readonly _toStatus: SgkStatus;
  private readonly _changedBy: string | null;
  private readonly _changedAt: Date;

  constructor(
    id: string,
    sgkTrackingId: string,
    fromStatus: SgkStatus,
    toStatus: SgkStatus,
    changedBy: string | null,
    changedAt: Date,
  ) {
    if (!id) throw new Error('History id is required');
    if (!sgkTrackingId) throw new Error('SGK tracking id is required');
    if (!fromStatus || !toStatus)
      throw new Error('From/to statuses are required');
    if (!changedAt) throw new Error('Changed at is required');

    this._id = id;
    this._sgkTrackingId = sgkTrackingId;
    this._fromStatus = fromStatus;
    this._toStatus = toStatus;
    this._changedBy = changedBy;
    this._changedAt = changedAt;
  }

  get id(): string {
    return this._id;
  }
  get sgkTrackingId(): string {
    return this._sgkTrackingId;
  }
  get fromStatus(): SgkStatus {
    return this._fromStatus;
  }
  get toStatus(): SgkStatus {
    return this._toStatus;
  }
  get changedBy(): string | null {
    return this._changedBy;
  }
  get changedAt(): Date {
    return this._changedAt;
  }
}
