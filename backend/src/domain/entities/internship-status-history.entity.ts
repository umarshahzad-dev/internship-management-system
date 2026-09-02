import { InternshipStatus } from '../enums/internship-status.enum';

export class InternshipStatusHistory {
  private readonly _id: string;
  private readonly _internshipId: string;
  private readonly _fromStatus: InternshipStatus;
  private readonly _toStatus: InternshipStatus;
  private readonly _reason: string | null;
  private readonly _changedBy: string | null;
  private readonly _changedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    fromStatus: InternshipStatus,
    toStatus: InternshipStatus,
    reason: string | null,
    changedBy: string | null,
    changedAt: Date,
  ) {
    if (!id) throw new Error('History id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!fromStatus || !toStatus)
      throw new Error('From/to statuses are required');
    if (!changedAt) throw new Error('Changed at timestamp is required');

    this._id = id;
    this._internshipId = internshipId;
    this._fromStatus = fromStatus;
    this._toStatus = toStatus;
    this._reason = reason?.trim() || null;
    this._changedBy = changedBy;
    this._changedAt = changedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get fromStatus(): InternshipStatus {
    return this._fromStatus;
  }
  get toStatus(): InternshipStatus {
    return this._toStatus;
  }
  get reason(): string | null {
    return this._reason;
  }
  get changedBy(): string | null {
    return this._changedBy;
  }
  get changedAt(): Date {
    return this._changedAt;
  }
}
