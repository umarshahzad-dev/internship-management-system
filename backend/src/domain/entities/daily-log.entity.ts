export class DailyLog {
  private readonly _id: string;
  private readonly _internshipId: string;
  private readonly _logDate: Date;
  private readonly _content: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    logDate: Date,
    content: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Daily log id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!logDate) throw new Error('Log date is required');
    if (!content || content.trim().length < 10) {
      throw new Error('Content must be at least 10 characters');
    }
    if (!createdAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._internshipId = internshipId;
    this._logDate = logDate;
    this._content = content.trim();
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get logDate(): Date {
    return this._logDate;
  }
  get content(): string {
    return this._content;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
