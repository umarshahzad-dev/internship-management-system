import { InternshipStatus } from '../enums/internship-status.enum';
import { DomainException } from '../../common/exceptions/domain.exception';

export class Internship {
  private readonly _id: string;
  private readonly _departmentId: string;
  private readonly _studentId: string;
  private readonly _companyId: string;
  private _status: InternshipStatus;
  private readonly _startDate: Date;
  private readonly _endDate: Date;
  private readonly _gradingData: Record<string, any>;
  private _locked: boolean;
  private _approvedAt: Date | null;
  private _approvedBy: string | null;
  private _employerApprovalIp: string | null;
  private _employerApprovalTimestamp: Date | null;
  private _commissionApprovalUserId: string | null;
  private _commissionApprovalTimestamp: Date | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    departmentId: string,
    studentId: string,
    companyId: string,
    status: InternshipStatus,
    startDate: Date,
    endDate: Date,
    gradingData: Record<string, any>,
    locked: boolean,
    approvedAt: Date | null,
    approvedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
    employerApprovalIp: string | null = null,
    employerApprovalTimestamp: Date | null = null,
    commissionApprovalUserId: string | null = null,
    commissionApprovalTimestamp: Date | null = null,
  ) {
    if (!id) throw new Error('Internship id is required');
    if (!departmentId) throw new Error('Department id is required');
    if (!studentId) throw new Error('Student id is required');
    if (!companyId) throw new Error('Company id is required');
    if (!status) throw new Error('Internship status is required');
    if (!startDate || !endDate)
      throw new Error('Start and end dates are required');
    if (startDate >= endDate)
      throw new Error('End date must be after start date');
    if (!createdAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._departmentId = departmentId;
    this._studentId = studentId;
    this._companyId = companyId;
    this._status = status;
    this._startDate = startDate;
    this._endDate = endDate;
    this._gradingData = gradingData || {};
    this._locked = locked;
    this._approvedAt = approvedAt;
    this._approvedBy = approvedBy;
    this._employerApprovalIp = employerApprovalIp;
    this._employerApprovalTimestamp = employerApprovalTimestamp;
    this._commissionApprovalUserId = commissionApprovalUserId;
    this._commissionApprovalTimestamp = commissionApprovalTimestamp;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get departmentId(): string {
    return this._departmentId;
  }
  get studentId(): string {
    return this._studentId;
  }
  get companyId(): string {
    return this._companyId;
  }
  get status(): InternshipStatus {
    return this._status;
  }
  get startDate(): Date {
    return this._startDate;
  }
  get endDate(): Date {
    return this._endDate;
  }
  get gradingData(): Record<string, any> {
    return this._gradingData;
  }
  get locked(): boolean {
    return this._locked;
  }
  get approvedAt(): Date | null {
    return this._approvedAt;
  }
  get approvedBy(): string | null {
    return this._approvedBy;
  }
  get employerApprovalIp(): string | null {
    return this._employerApprovalIp;
  }
  get employerApprovalTimestamp(): Date | null {
    return this._employerApprovalTimestamp;
  }
  get commissionApprovalUserId(): string | null {
    return this._commissionApprovalUserId;
  }
  get commissionApprovalTimestamp(): Date | null {
    return this._commissionApprovalTimestamp;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  submitToEmployer(): void {
    if (
      this._status !== InternshipStatus.DRAFT &&
      this._status !== InternshipStatus.REVISION_REQUESTED
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only DRAFT or REVISION_REQUESTED internships can be submitted to employer',
        409,
      );
    }
    this._status = InternshipStatus.PENDING_EMPLOYER;
  }

  employerApprove(ipAddress: string, timestamp: Date): void {
    if (this._status !== InternshipStatus.PENDING_EMPLOYER) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Internship must be in PENDING_EMPLOYER state',
        409,
      );
    }
    this._employerApprovalIp = ipAddress;
    this._employerApprovalTimestamp = timestamp;
    this._status = InternshipStatus.PENDING_COMMISSION;
  }

  commissionApprove(userId: string, timestamp: Date): void {
    if (this._status !== InternshipStatus.PENDING_COMMISSION) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Internship must be in PENDING_COMMISSION state',
        409,
      );
    }
    this._commissionApprovalUserId = userId;
    this._commissionApprovalTimestamp = timestamp;
    this._approvedBy = userId;
    this._approvedAt = timestamp;
    this._status = InternshipStatus.APPROVED_PENDING_SGK;
  }

  completeOngoing(now: Date): void {
    if (this._status !== InternshipStatus.ONGOING) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Only ONGOING internships can be completed',
        409,
      );
    }
    // Set hours to 0 to compare purely by date, ignoring time of day
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date(this._endDate);
    end.setUTCHours(0, 0, 0, 0);

    if (today < end) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Cannot complete internship before its end date',
        409,
      );
    }
    this._status = InternshipStatus.EVALUATION;
  }

  updateStatus(newStatus: InternshipStatus, now: Date): void {
    this._status = newStatus;
    if (newStatus === InternshipStatus.APPROVED) {
      this._approvedAt = now;
    }
    if (
      [
        InternshipStatus.APPROVED,
        InternshipStatus.COMPLETED,
        InternshipStatus.REJECTED,
        InternshipStatus.WITHDRAWN,
      ].includes(newStatus)
    ) {
      this._locked = true;
    }
  }

  setApprovedBy(userId: string | null): void {
    this._approvedBy = userId;
  }

  lock(): void {
    this._locked = true;
  }

  isLocked(): boolean {
    return this._locked;
  }
}
