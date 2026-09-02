import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface ValidateEmployerTokenInput {
  plainToken: string;
}

export interface ValidateEmployerTokenResult {
  valid: true;
  internshipId: string;
  studentName: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

@Injectable()
export class ValidateEmployerTokenUseCase {
  constructor(
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    input: ValidateEmployerTokenInput,
  ): Promise<ValidateEmployerTokenResult> {
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

    const company = await this.companyRepository.findById(internship.companyId);
    if (!company) {
      throw new DomainException('NOT_FOUND', 'Company not found', 404);
    }

    const student = await this.userRepository.findById(internship.studentId);
    if (!student) {
      throw new DomainException('NOT_FOUND', 'Student not found', 404);
    }

    return {
      valid: true,
      internshipId: internship.id,
      studentName: `${student.firstName} ${student.lastName}`,
      companyName: company.name,
      startDate: internship.startDate.toISOString().slice(0, 10),
      endDate: internship.endDate.toISOString().slice(0, 10),
    };
  }
}
