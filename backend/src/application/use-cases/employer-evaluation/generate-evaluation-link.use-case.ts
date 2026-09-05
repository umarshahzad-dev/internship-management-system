import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { EmployerToken } from '../../../domain/entities/employer-token.entity';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { EmployerTokenType } from '../../../domain/enums/employer-token-type.enum';

export interface GenerateEvaluationLinkInput {
  internshipId: string;
  academicId: string;
  academicDepartmentId: string;
}

export interface GenerateEvaluationLinkResult {
  plainToken: string;
  expiresAt: string;
}

@Injectable()
export class GenerateEvaluationLinkUseCase {
  constructor(
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: GenerateEvaluationLinkInput,
  ): Promise<GenerateEvaluationLinkResult> {
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

    if (
      internship.status !== InternshipStatus.APPROVED &&
      internship.status !== InternshipStatus.ONGOING &&
      internship.status !== InternshipStatus.EVALUATION
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Evaluation link can only be generated for approved, ongoing, or evaluation internships',
        409,
      );
    }

    const now = this.dateProvider.now();
    const existingActive =
      await this.employerTokenRepository.findActiveByInternship(
        input.internshipId,
      );

    if (existingActive) {
      // Invalidate the old active token so we can create a new one.
      // The academic cannot retrieve the plaintext of the old token, so this is the only way
      // to allow regeneration without breaking the unique active token constraint.
      const revokedToken = new EmployerToken(
        existingActive.tokenHash,
        existingActive.internshipId,
        existingActive.type || EmployerTokenType.EVALUATION,
        existingActive.expiresAt,
        true,
        now,
        existingActive.createdAt,
      );
      await this.employerTokenRepository.update(revokedToken);
    }

    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');

    const token = new EmployerToken(
      tokenHash,
      input.internshipId,
      EmployerTokenType.EVALUATION,
      expiresAt,
      false,
      null,
      now,
    );

    await this.employerTokenRepository.create(token);

    return {
      plainToken,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
