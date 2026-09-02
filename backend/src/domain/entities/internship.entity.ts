import { InternshipStatus } from '../enums/internship-status.enum';

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
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateStatus(newStatus: InternshipStatus, now: Date): void {
    this._status = newStatus;
    if (newStatus === InternshipStatus.APPROVED) {
      this._approvedAt = now;
    }
    if (
      [InternshipStatus.APPROVED, InternshipStatus.COMPLETED].includes(
        newStatus,
      )
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
