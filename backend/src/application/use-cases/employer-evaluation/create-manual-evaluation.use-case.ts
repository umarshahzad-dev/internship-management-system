import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import {
  EmployerEvaluation,
  CriterionGrade,
} from '../../../domain/entities/employer-evaluation.entity';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { EvaluationMethod } from '../../../domain/enums/evaluation-method.enum';

export interface CreateManualEvaluationInput {
  internshipId: string;
  academicId: string;
  academicDepartmentId: string;
  employerName: string;
  grades: Record<string, string>;
  comments?: string | null;
  scannedSicilFisi?: Express.Multer.File | null;
}

export interface CreateManualEvaluationResult {
  id: string;
  internshipId: string;
  method: EvaluationMethod;
  submittedAt: string;
}

@Injectable()
export class CreateManualEvaluationUseCase {
  constructor(
    private readonly employerEvaluationRepository: IEmployerEvaluationRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly fileStorage: IFileStorage,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: CreateManualEvaluationInput,
  ): Promise<CreateManualEvaluationResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot manage other departments',
        403,
      );
    }

    const existingEval =
      await this.employerEvaluationRepository.findByInternship(
        input.internshipId,
      );
    if (existingEval) {
      throw new DomainException(
        'CONFLICT',
        'Evaluation already exists for this internship',
        409,
      );
    }

    const grades = this.parseAndValidateGrades(input.grades);
    const now = this.dateProvider.now();

    let scannedPath: string | null = null;
    if (input.scannedSicilFisi) {
      const ext = path
        .extname(input.scannedSicilFisi.originalname)
        .slice(1)
        .toLowerCase();
      if (!['pdf', 'jpg', 'png'].includes(ext)) {
        throw new DomainException(
          'FILE_TYPE_NOT_ALLOWED',
          `File type .${ext} not allowed`,
          415,
        );
      }
      const filename = `${randomUUID()}.${ext}`;
      scannedPath = await this.fileStorage.save(
        input.scannedSicilFisi.buffer,
        'sicil-fisi',
        filename,
      );
    }

    const evaluation = new EmployerEvaluation(
      randomUUID(),
      internship.id,
      EvaluationMethod.MANUAL,
      input.employerName,
      input.academicId,
      grades,
      input.comments ?? null,
      scannedPath,
      now,
      now,
    );

    const saved = await this.employerEvaluationRepository.create(evaluation);

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      method: saved.method,
      submittedAt: saved.submittedAt.toISOString(),
    };
  }

  private parseAndValidateGrades(
    rawGrades: Record<string, string>,
  ): Record<string, CriterionGrade> {
    const criteria = [
      'attendance',
      'effort',
      'timeliness',
      'conduct',
      'teamwork',
      'ethics',
      'self_improvement',
    ];
    const grades: Record<string, CriterionGrade> = {};
    for (const criterion of criteria) {
      const letter = rawGrades[criterion];
      if (!letter) {
        throw new DomainException(
          'VALIDATION_ERROR',
          `Missing grade for ${criterion}`,
          400,
        );
      }
      const score = this.letterToScore(letter);
      grades[criterion] = { letter, score };
    }
    return grades;
  }

  private letterToScore(letter: string): number {
    const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    const score = map[letter.toUpperCase()];
    if (score === undefined) {
      throw new DomainException(
        'VALIDATION_ERROR',
        `Invalid grade letter: ${letter}`,
        400,
      );
    }
    return score;
  }
}
