export class UserSecurityState {
  private readonly _userId: string;
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private readonly _passwordChangedAt: Date;
  private _updatedAt: Date;

  constructor(
    userId: string,
    failedLoginAttempts: number,
    lockedUntil: Date | null,
    passwordChangedAt: Date,
    updatedAt: Date,
  ) {
    if (!userId) throw new Error('User id is required');
    if (failedLoginAttempts < 0)
      throw new Error('Failed login attempts cannot be negative');
    if (!passwordChangedAt) throw new Error('Password changed at is required');
    if (!updatedAt) throw new Error('Updated at is required');

    this._userId = userId;
    this._failedLoginAttempts = failedLoginAttempts;
    this._lockedUntil = lockedUntil;
    this._passwordChangedAt = passwordChangedAt;
    this._updatedAt = updatedAt;
  }

  get userId(): string {
    return this._userId;
  }
  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }
  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }
  get passwordChangedAt(): Date {
    return this._passwordChangedAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  incrementFailedAttempts(): void {
    this._failedLoginAttempts += 1;
    this._updatedAt = new Date();
  }

  resetFailedAttempts(): void {
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
    this._updatedAt = new Date();
  }

  lockUntil(date: Date): void {
    this._lockedUntil = date;
    this._updatedAt = new Date();
  }

  isLocked(now: Date): boolean {
    return this._lockedUntil !== null && now < this._lockedUntil;
  }
}
