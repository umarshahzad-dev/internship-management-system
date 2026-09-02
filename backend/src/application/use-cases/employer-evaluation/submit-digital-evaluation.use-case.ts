import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import {
  EmployerEvaluation,
  CriterionGrade,
} from '../../../domain/entities/employer-evaluation.entity';
import { EmployerToken } from '../../../domain/entities/employer-token.entity';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { EvaluationMethod } from '../../../domain/enums/evaluation-method.enum';

export interface SubmitDigitalEvaluationInput {
  plainToken: string;
  employerName: string;
  grades: Record<string, string>;
  comments?: string | null;
}

export interface SubmitDigitalEvaluationResult {
  id: string;
  internshipId: string;
  method: EvaluationMethod;
  submittedAt: string;
}

@Injectable()
export class SubmitDigitalEvaluationUseCase {
  constructor(
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly employerEvaluationRepository: IEmployerEvaluationRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: SubmitDigitalEvaluationInput,
  ): Promise<SubmitDigitalEvaluationResult> {
    const tokenHash = createHash('sha256')
      .update(input.plainToken)
      .digest('hex');
    const token = await this.employerTokenRepository.findByTokenHash(tokenHash);

    if (!token) {
      throw new DomainException('NOT_FOUND', 'Invalid token', 404);
    }
    if (token.isUsed) {
      throw new DomainException('TOKEN_USED', 'Token already used', 404);
    }
    if (token.isExpired(new Date())) {
      throw new DomainException('TOKEN_EXPIRED', 'Token expired', 404);
    }

    const internship = await this.internshipRepository.findById(
      token.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    // Check if evaluation already exists
    const existingEval =
      await this.employerEvaluationRepository.findByInternship(internship.id);
    if (existingEval) {
      throw new DomainException(
        'CONFLICT',
        'Evaluation already exists for this internship',
        409,
      );
    }

    const grades = this.parseAndValidateGrades(input.grades);
    const now = this.dateProvider.now();

    const evaluation = new EmployerEvaluation(
      randomUUID(),
      internship.id,
      EvaluationMethod.DIGITAL,
      input.employerName,
      null,
      grades,
      input.comments ?? null,
      null,
      now,
      now,
    );

    const saved = await this.employerEvaluationRepository.create(evaluation);

    // Mark token used
    const usedToken = new EmployerToken(
      token.tokenHash,
      token.internshipId,
      token.expiresAt,
      true,
      now,
      token.createdAt,
    );
    await this.employerTokenRepository.update(usedToken);

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
