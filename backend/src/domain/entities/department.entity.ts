export class Department {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _facultyName: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    name: string,
    facultyName: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Department id is required');
    if (!name || name.trim().length === 0)
      throw new Error('Department name is required');
    if (!facultyName || facultyName.trim().length === 0)
      throw new Error('Faculty name is required');

    this._id = id;
    this._name = name.trim();
    this._facultyName = facultyName.trim();
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get facultyName(): string {
    return this._facultyName;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
