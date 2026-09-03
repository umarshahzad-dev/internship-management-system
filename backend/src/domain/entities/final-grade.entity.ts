export class FinalGrade {
  private readonly _id: string;
  private readonly _internshipId: string;
  private readonly _employerScore: number;
  private readonly _academicScore: number;
  private readonly _finalScore: number;
  private readonly _letterGrade: string;
  private readonly _calculatedAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    employerScore: number,
    academicScore: number,
    finalScore: number,
    letterGrade: string,
    calculatedAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Final grade id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (employerScore < 0 || employerScore > 100) {
      throw new Error('Employer score must be between 0 and 100');
    }
    if (academicScore < 0 || academicScore > 100) {
      throw new Error('Academic score must be between 0 and 100');
    }
    if (finalScore < 0 || finalScore > 100) {
      throw new Error('Final score must be between 0 and 100');
    }
    if (!letterGrade || letterGrade.trim().length === 0) {
      throw new Error('Letter grade is required');
    }
    if (!calculatedAt || !updatedAt) throw new Error('Timestamps are required');

    this._id = id;
    this._internshipId = internshipId;
    this._employerScore = employerScore;
    this._academicScore = academicScore;
    this._finalScore = finalScore;
    this._letterGrade = letterGrade.trim();
    this._calculatedAt = calculatedAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get employerScore(): number {
    return this._employerScore;
  }
  get academicScore(): number {
    return this._academicScore;
  }
  get finalScore(): number {
    return this._finalScore;
  }
  get letterGrade(): string {
    return this._letterGrade;
  }
  get calculatedAt(): Date {
    return this._calculatedAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
