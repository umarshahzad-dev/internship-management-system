export class Company {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _taxNumber: string;
  private _city: string | null;
  private _industry: string | null;
  private _address: string | null;
  private _website: string | null;
  private _contactPerson: string | null;
  private _contactEmail: string | null;
  private _contactPhone: string | null;
  private _isVerified: boolean;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    name: string,
    taxNumber: string,
    city: string | null,
    industry: string | null,
    address: string | null,
    website: string | null,
    contactPerson: string | null,
    contactEmail: string | null,
    contactPhone: string | null,
    isVerified: boolean,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Company id is required');
    if (!name || name.trim().length === 0)
      throw new Error('Company name is required');
    if (!taxNumber || !/^[0-9]{10}$/.test(taxNumber))
      throw new Error('Tax number must be 10 digits');
    if (!createdAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._name = name.trim();
    this._taxNumber = taxNumber;
    this._city = city?.trim() || null;
    this._industry = industry?.trim() || null;
    this._address = address?.trim() || null;
    this._website = website?.trim() || null;
    this._contactPerson = contactPerson?.trim() || null;
    this._contactEmail = contactEmail?.trim() || null;
    this._contactPhone = contactPhone?.trim() || null;
    this._isVerified = isVerified;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get taxNumber(): string {
    return this._taxNumber;
  }
  get city(): string | null {
    return this._city;
  }
  get industry(): string | null {
    return this._industry;
  }
  get address(): string | null {
    return this._address;
  }
  get website(): string | null {
    return this._website;
  }
  get contactPerson(): string | null {
    return this._contactPerson;
  }
  get contactEmail(): string | null {
    return this._contactEmail;
  }
  get contactPhone(): string | null {
    return this._contactPhone;
  }
  get isVerified(): boolean {
    return this._isVerified;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  verify(): void {
    this._isVerified = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  activate(): void {
    this._isActive = true;
  }
}
