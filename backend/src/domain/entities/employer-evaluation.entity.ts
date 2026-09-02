import { EvaluationMethod } from '../enums/evaluation-method.enum';

export interface CriterionGrade {
  letter: string;
  score: number;
}

export class EmployerEvaluation {
  private readonly _id: string;
  private readonly _internshipId: string;
  private readonly _method: EvaluationMethod;
  private readonly _employerName: string;
  private readonly _enteredBy: string | null;
  private readonly _grades: Record<string, CriterionGrade>;
  private readonly _comments: string | null;
  private readonly _scannedSicilFisiPath: string | null;
  private readonly _submittedAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    id: string,
    internshipId: string,
    method: EvaluationMethod,
    employerName: string,
    enteredBy: string | null,
    grades: Record<string, CriterionGrade>,
    comments: string | null,
    scannedSicilFisiPath: string | null,
    submittedAt: Date,
    updatedAt: Date,
  ) {
    if (!id) throw new Error('Evaluation id is required');
    if (!internshipId) throw new Error('Internship id is required');
    if (!method) throw new Error('Method is required');
    if (!employerName || employerName.trim().length === 0)
      throw new Error('Employer name is required');
    if (!grades || Object.keys(grades).length === 0)
      throw new Error('Grades are required');
    if (!submittedAt || !updatedAt) throw new Error('Timestamps are required');
    // Validate grades contain all 7 criteria
    const requiredCriteria = [
      'attendance',
      'effort',
      'timeliness',
      'conduct',
      'teamwork',
      'ethics',
      'self_improvement',
    ];
    for (const criterion of requiredCriteria) {
      if (
        !grades[criterion] ||
        !grades[criterion].letter ||
        grades[criterion].score === undefined
      ) {
        throw new Error(`Missing grade for criterion: ${criterion}`);
      }
    }

    this._id = id;
    this._internshipId = internshipId;
    this._method = method;
    this._employerName = employerName.trim();
    this._enteredBy = enteredBy;
    this._grades = JSON.parse(JSON.stringify(grades));
    this._comments = comments?.trim() || null;
    this._scannedSicilFisiPath = scannedSicilFisiPath?.trim() || null;
    this._submittedAt = submittedAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get internshipId(): string {
    return this._internshipId;
  }
  get method(): EvaluationMethod {
    return this._method;
  }
  get employerName(): string {
    return this._employerName;
  }
  get enteredBy(): string | null {
    return this._enteredBy;
  }
  get grades(): Record<string, CriterionGrade> {
    return this._grades;
  }
  get comments(): string | null {
    return this._comments;
  }
  get scannedSicilFisiPath(): string | null {
    return this._scannedSicilFisiPath;
  }
  get submittedAt(): Date {
    return this._submittedAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  calculateEmployerScore(): number {
    const values = Object.values(this._grades).map((grade) => grade.score);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return (average / 5) * 100;
  }
}
