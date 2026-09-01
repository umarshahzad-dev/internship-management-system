export class Holiday {
  private readonly _id: string;
  private readonly _departmentId: string | null;
  private readonly _holidayDate: Date;
  private readonly _name: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    departmentId: string | null,
    holidayDate: Date,
    name: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Holiday id is required');
    if (!holidayDate) throw new Error('Holiday date is required');
    if (!name || name.trim().length === 0)
      throw new Error('Holiday name is required');
    if (!createdAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._departmentId = departmentId;
    this._holidayDate = holidayDate;
    this._name = name.trim();
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get departmentId(): string | null {
    return this._departmentId;
  }
  get holidayDate(): Date {
    return this._holidayDate;
  }
  get name(): string {
    return this._name;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
