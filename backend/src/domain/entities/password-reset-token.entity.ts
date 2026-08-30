export class PasswordResetToken {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private _usedAt: Date | null;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    usedAt: Date | null,
    createdAt: Date,
  ) {
    if (!id) throw new Error('Password reset token id is required');
    if (!userId) throw new Error('User id is required');
    if (!tokenHash) throw new Error('Token hash is required');
    if (!expiresAt) throw new Error('Expires at is required');
    if (!createdAt) throw new Error('Created at is required');

    this._id = id;
    this._userId = userId;
    this._tokenHash = tokenHash;
    this._expiresAt = expiresAt;
    this._usedAt = usedAt;
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
  get usedAt(): Date | null {
    return this._usedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  markUsed(date: Date): void {
    this._usedAt = date;
  }

  isExpired(now: Date): boolean {
    return now > this._expiresAt;
  }

  isUsed(): boolean {
    return this._usedAt !== null;
  }
}
