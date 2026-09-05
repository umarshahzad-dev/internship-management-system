export class AcademicCalendar {
  private readonly _id: string;
  private readonly _departmentId: string;
  private readonly _termName: string;
  private readonly _applicationStart: Date;
  private readonly _applicationEnd: Date;
  private readonly _internshipStart: Date;
  private readonly _internshipEnd: Date;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    departmentId: string,
    termName: string,
    applicationStart: Date,
    applicationEnd: Date,
    internshipStart: Date,
    internshipEnd: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Calendar id is required');
    if (!departmentId) throw new Error('Department id is required');
    if (!termName || termName.trim().length === 0)
      throw new Error('Term name is required');
    if (
      !applicationStart ||
      !applicationEnd ||
      !internshipStart ||
      !internshipEnd
    ) {
      throw new Error('All dates are required');
    }
    if (applicationEnd < applicationStart)
      throw new Error('Application end must be after start');
    if (internshipEnd < internshipStart)
      throw new Error('Internship end must be after start');
    if (applicationEnd > internshipStart)
      throw new Error('Application must end before internship starts');

    this._id = id;
    this._departmentId = departmentId;
    this._termName = termName.trim();
    this._applicationStart = applicationStart;
    this._applicationEnd = applicationEnd;
    this._internshipStart = internshipStart;
    this._internshipEnd = internshipEnd;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get departmentId(): string {
    return this._departmentId;
  }
  get termName(): string {
    return this._termName;
  }
  get applicationStart(): Date {
    return this._applicationStart;
  }
  get applicationEnd(): Date {
    return this._applicationEnd;
  }
  get internshipStart(): Date {
    return this._internshipStart;
  }
  get internshipEnd(): Date {
    return this._internshipEnd;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  isApplicationOpen(now: Date): boolean {
    return now >= this._applicationStart && now <= this._applicationEnd;
  }

  isInternshipPeriod(now: Date): boolean {
    return now >= this._internshipStart && now <= this._internshipEnd;
  }
}
