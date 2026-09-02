import { SgkStatus } from '../enums/sgk-status.enum';

export class SgkTracking {
  private readonly _id: string;
  private readonly _internshipId: string;
  private _status: SgkStatus;
  private _documentPath: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    status: SgkStatus,
    documentPath: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('SGK tracking id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!status) throw new Error('Status is required');
    if (!createdAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._internshipId = internshipId;
    this._status = status;
    this._documentPath = documentPath?.trim() || null;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get status(): SgkStatus {
    return this._status;
  }
  get documentPath(): string | null {
    return this._documentPath;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateStatus(newStatus: SgkStatus, now: Date): void {
    this._status = newStatus;
    // We cannot update _updatedAt directly because it's readonly; use a new entity approach instead.
  }

  setDocumentPath(path: string | null): void {
    this._documentPath = path?.trim() || null;
  }
}
