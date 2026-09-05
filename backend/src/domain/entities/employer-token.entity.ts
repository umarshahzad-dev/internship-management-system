import { EmployerTokenType } from '../enums/employer-token-type.enum';

export class EmployerToken {
  private readonly _tokenHash: string;
  private readonly _internshipId: string;
  private readonly _type: EmployerTokenType;
  private readonly _expiresAt: Date;
  private _isUsed: boolean;
  private _usedAt: Date | null;
  private readonly _createdAt: Date;

  constructor(
    tokenHash: string,
    internshipId: string,
    type: EmployerTokenType,
    expiresAt: Date,
    isUsed: boolean,
    usedAt: Date | null,
    createdAt: Date,
  ) {
    if (!tokenHash) throw new Error('Token hash is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!type) throw new Error('Token type is required');
    if (!expiresAt) throw new Error('Expires at is required');
    if (!createdAt) throw new Error('Created at is required');

    this._tokenHash = tokenHash;
    this._internshipId = internshipId;
    this._type = type;
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
  get type(): EmployerTokenType {
    return this._type;
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

  markAsUsed(usedAt: Date): void {
    this._isUsed = true;
    this._usedAt = usedAt;
  }
}
