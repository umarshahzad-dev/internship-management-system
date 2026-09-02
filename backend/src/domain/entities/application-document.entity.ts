import { ApplicationDocumentStatus } from '../enums/application-document-status.enum';

export class ApplicationDocument {
  private readonly _id: string;
  private readonly _internshipId: string;
  private readonly _documentTypeId: string;
  private readonly _filePath: string;
  private readonly _originalFilename: string;
  private _status: ApplicationDocumentStatus;
  private _rejectionReason: string | null;
  private readonly _versionNumber: number;
  private readonly _uploadedAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    documentTypeId: string,
    filePath: string,
    originalFilename: string,
    status: ApplicationDocumentStatus,
    rejectionReason: string | null,
    versionNumber: number,
    uploadedAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Application document id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!documentTypeId) throw new Error('Document type id is required');
    if (!filePath || filePath.trim().length === 0)
      throw new Error('File path is required');
    if (!originalFilename || originalFilename.trim().length === 0)
      throw new Error('Original filename is required');
    if (!status) throw new Error('Status is required');
    if (versionNumber <= 0) throw new Error('Version number must be positive');

    this._id = id;
    this._internshipId = internshipId;
    this._documentTypeId = documentTypeId;
    this._filePath = filePath.trim();
    this._originalFilename = originalFilename.trim();
    this._status = status;
    this._rejectionReason = rejectionReason?.trim() || null;
    this._versionNumber = versionNumber;
    this._uploadedAt = uploadedAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get documentTypeId(): string {
    return this._documentTypeId;
  }
  get filePath(): string {
    return this._filePath;
  }
  get originalFilename(): string {
    return this._originalFilename;
  }
  get status(): ApplicationDocumentStatus {
    return this._status;
  }
  get rejectionReason(): string | null {
    return this._rejectionReason;
  }
  get versionNumber(): number {
    return this._versionNumber;
  }
  get uploadedAt(): Date {
    return this._uploadedAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  accept(): void {
    this._status = ApplicationDocumentStatus.ACCEPTED;
    this._rejectionReason = null;
  }

  reject(reason: string): void {
    this._status = ApplicationDocumentStatus.REJECTED;
    this._rejectionReason = reason.trim();
  }
}
