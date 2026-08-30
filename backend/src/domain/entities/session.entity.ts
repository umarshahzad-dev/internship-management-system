export class Session {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _csrfToken: string;
  private readonly _expiresAt: Date;
  private _lastActivityAt: Date;
  private _revokedAt: Date | null;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    userId: string,
    csrfToken: string,
    expiresAt: Date,
    lastActivityAt: Date,
    revokedAt: Date | null,
    createdAt: Date,
  ) {
    if (!id) throw new Error('Session id is required');
    if (!userId) throw new Error('User id is required');
    if (!csrfToken) throw new Error('CSRF token is required');
    if (!expiresAt) throw new Error('Expires at is required');
    if (!lastActivityAt) throw new Error('Last activity is required');
    if (!createdAt) throw new Error('Created at is required');

    this._id = id;
    this._userId = userId;
    this._csrfToken = csrfToken;
    this._expiresAt = expiresAt;
    this._lastActivityAt = lastActivityAt;
    this._revokedAt = revokedAt;
    this._createdAt = createdAt;
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get csrfToken(): string {
    return this._csrfToken;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get lastActivityAt(): Date {
    return this._lastActivityAt;
  }
  get revokedAt(): Date | null {
    return this._revokedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  updateLastActivity(date: Date): void {
    this._lastActivityAt = date;
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
}
