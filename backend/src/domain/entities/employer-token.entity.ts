export class EmployerToken {
  private readonly _tokenHash: string;
  private readonly _internshipId: string;
  private readonly _expiresAt: Date;
  private readonly _isUsed: boolean;
  private readonly _usedAt: Date | null;
  private readonly _createdAt: Date;

  constructor(
    tokenHash: string,
    internshipId: string,
    expiresAt: Date,
    isUsed: boolean,
    usedAt: Date | null,
    createdAt: Date,
  ) {
    if (!tokenHash) throw new Error('Token hash is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!expiresAt) throw new Error('Expires at is required');
    if (!createdAt) throw new Error('Created at is required');

    this._tokenHash = tokenHash;
    this._internshipId = internshipId;
    this._expiresAt = expiresAt;
    this._isUsed = isUsed;
    this._usedAt = usedAt;
    this._createdAt = createdAt;
  }

  get tokenHash(): string {
    return this._tokenHash;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get isUsed(): boolean {
    return this._isUsed;
  }
  get usedAt(): Date | null {
    return this._usedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  isExpired(now: Date): boolean {
    return now > this._expiresAt;
  }
}
