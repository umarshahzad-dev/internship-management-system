import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { EmployerToken } from '../../../domain/entities/employer-token.entity';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

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
        'Evaluation link can only be generated for approved or ongoing internships',
        409,
      );
    }

    // If an active token exists, return a new one? To avoid multiple active tokens, we'll reuse the existing active token.
    const existingActive =
      await this.employerTokenRepository.findActiveByInternship(
        input.internshipId,
      );
    if (existingActive) {
      // Return existing active token's plain? We cannot recover plain from hash. So generate a new one and revoke old?
      // For simplicity, we'll create a new token even if active exists. But unique partial index may fail.
      // Better to return conflict if active token exists.
      throw new DomainException(
        'CONFLICT',
        'An active evaluation link already exists. Use that link or wait until it is used/expired.',
        409,
      );
    }

    const now = this.dateProvider.now();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const plainToken = randomBytes(32).toString('hex'); // 64 chars
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');

    const token = new EmployerToken(
      tokenHash,
      input.internshipId,
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
