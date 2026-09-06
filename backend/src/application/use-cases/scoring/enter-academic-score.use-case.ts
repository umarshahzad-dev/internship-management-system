import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FinalGrade } from '../../../domain/entities/final-grade.entity';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IFinalGradeRepository } from '../../ports/final-grade.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface EnterAcademicScoreInput {
  internshipId: string;
  academicId: string;
  academicDepartmentId: string;
  logQuality: number;
  reportQuality: number;
}

export interface EnterAcademicScoreResult {
  id: string;
  internshipId: string;
  employerScore: number;
  academicScore: number;
  finalScore: number;
  letterGrade: string;
}

@Injectable()
export class EnterAcademicScoreUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly internshipHistoryRepository: IInternshipStatusHistoryRepository,
    private readonly employerEvaluationRepository: IEmployerEvaluationRepository,
    private readonly finalGradeRepository: IFinalGradeRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: EnterAcademicScoreInput,
  ): Promise<EnterAcademicScoreResult> {
    if (input.logQuality < 0 || input.logQuality > 100)
      throw new DomainException(
        'VALIDATION_ERROR',
        'Log quality must be between 0 and 100',
        400,
      );
    if (input.reportQuality < 0 || input.reportQuality > 100)
      throw new DomainException(
        'VALIDATION_ERROR',
        'Report quality must be between 0 and 100',
        400,
      );

    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    if (internship.departmentId !== input.academicDepartmentId)
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot score other departments',
        403,
      );

    const oldStatus = internship.status;

    const evaluation = await this.employerEvaluationRepository.findByInternship(
      internship.id,
    );
    if (!evaluation)
      throw new DomainException(
        'EMPLOYER_EVALUATION_MISSING',
        'Employer evaluation is required before academic scoring',
        409,
      );

    const gradingData = internship.gradingData;
    let logWeight = 0.7;
    let reportWeight = 0.3;
    if (gradingData?.academic_criteria) {
      logWeight = gradingData.academic_criteria.log_quality / 100;
      reportWeight = gradingData.academic_criteria.report / 100;
    }

    const academicScore =
      input.logQuality * logWeight + input.reportQuality * reportWeight;
    const employerScore = evaluation.calculateEmployerScore();
    let employerWeight = 0.4;
    let academicWeight = 0.6;
    if (gradingData?.weights) {
      employerWeight = gradingData.weights.employer;
      academicWeight = gradingData.weights.academic;
    }

    const finalScore =
      employerScore * employerWeight + academicScore * academicWeight;
    const letterGrade = this.determineLetterGrade(
      finalScore,
      gradingData?.letter_grade_scale,
    );

    const now = this.dateProvider.now();
    const finalGrade = new FinalGrade(
      randomUUID(),
      internship.id,
      employerScore,
      academicScore,
      finalScore,
      letterGrade,
      now,
      now,
    );
    const saved = await this.finalGradeRepository.create(finalGrade);

    // Securely update status via domain method
    internship.markAsGraded(now);
    await this.internshipRepository.update(internship);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      oldStatus,
      internship.status,
      null,
      input.academicId,
      now,
    );
    await this.internshipHistoryRepository.create(history);

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      employerScore: saved.employerScore,
      academicScore: saved.academicScore,
      finalScore: saved.finalScore,
      letterGrade: saved.letterGrade,
    };
  }

  private determineLetterGrade(
    score: number,
    scale?: Record<string, [number, number]>,
  ): string {
    if (!scale) {
      scale = {
        AA: [90, 100],
        BA: [80, 89],
        BB: [70, 79],
        CB: [60, 69],
        CC: [50, 59],
        DC: [40, 49],
        DD: [30, 39],
        FF: [0, 29],
      };
    }
    for (const [letter, range] of Object.entries(scale)) {
      if (score >= range[0] && score <= range[1]) return letter;
    }
    return 'FF';
  }
}
