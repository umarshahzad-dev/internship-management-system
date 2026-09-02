export class DocumentType {
  private readonly _id: string;
  private readonly _departmentId: string;
  private _name: string;
  private _description: string | null;
  private _isRequired: boolean;
  private _allowedFileTypes: string[];
  private _maxFileSize: number;
  private _templatePath: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    departmentId: string,
    name: string,
    description: string | null,
    isRequired: boolean,
    allowedFileTypes: string[],
    maxFileSize: number,
    templatePath: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Document type id is required');
    if (!departmentId) throw new Error('Department id is required');
    if (!name || name.trim().length === 0)
      throw new Error('Document type name is required');
    if (!allowedFileTypes || allowedFileTypes.length === 0) {
      throw new Error('At least one allowed file type is required');
    }
    if (!maxFileSize || maxFileSize <= 0)
      throw new Error('Max file size must be positive');

    this._id = id;
    this._departmentId = departmentId;
    this._name = name.trim();
    this._description = description?.trim() || null;
    this._isRequired = isRequired;
    this._allowedFileTypes = [...allowedFileTypes];
    this._maxFileSize = maxFileSize;
    this._templatePath = templatePath?.trim() || null;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get departmentId(): string {
    return this._departmentId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get isRequired(): boolean {
    return this._isRequired;
  }
  get allowedFileTypes(): string[] {
    return [...this._allowedFileTypes];
  }
  get maxFileSize(): number {
    return this._maxFileSize;
  }
  get templatePath(): string | null {
    return this._templatePath;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
