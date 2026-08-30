export class RefreshToken {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private _rotatedAt: Date | null;
  private _revokedAt: Date | null;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    rotatedAt: Date | null,
    revokedAt: Date | null,
    createdAt: Date,
  ) {
    if (!id) throw new Error('Refresh token id is required');
    if (!userId) throw new Error('User id is required');
    if (!tokenHash) throw new Error('Token hash is required');
    if (!expiresAt) throw new Error('Expires at is required');
    if (!createdAt) throw new Error('Created at is required');

    this._id = id;
    this._userId = userId;
    this._tokenHash = tokenHash;
    this._expiresAt = expiresAt;
    this._rotatedAt = rotatedAt;
    this._revokedAt = revokedAt;
    this._createdAt = createdAt;
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get tokenHash(): string {
    return this._tokenHash;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get rotatedAt(): Date | null {
    return this._rotatedAt;
  }
  get revokedAt(): Date | null {
    return this._revokedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  markRotated(date: Date): void {
    this._rotatedAt = date;
  }

  revoke(date: Date): void {
    this._revokedAt = date;
  }

  isExpired(now: Date): boolean {
    return now > this._expiresAt;
  }

  isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  isRotated(): boolean {
    return this._rotatedAt !== null;
  }
}
