import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { EmployerTokenType } from '../../../domain/enums/employer-token-type.enum';
import { Company } from '../../../domain/entities/company.entity';

export interface EmployerApproveInput {
  token: string;
  ipAddress: string;
  sgkNumber?: string;
  iban?: string;
}

@Injectable()
export class EmployerApproveApplicationUseCase {
  private readonly logger = new Logger(EmployerApproveApplicationUseCase.name);

  constructor(
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: EmployerApproveInput): Promise<void> {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    const token = await this.employerTokenRepository.findByTokenHash(tokenHash);

    if (
      !token ||
      token.isUsed ||
      token.isExpired(this.dateProvider.now()) ||
      token.type !== EmployerTokenType.APPLICATION_APPROVAL
    ) {
      throw new DomainException(
        'UNAUTHORIZED',
        'Invalid or expired token',
        401,
      );
    }

    const internship = await this.internshipRepository.findById(
      token.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    // Approve the internship via state machine
    const now = this.dateProvider.now();
    internship.employerApprove(input.ipAddress, now);
    await this.internshipRepository.update(internship);

    // Update company fiscal data if provided
    const company = await this.companyRepository.findById(internship.companyId);
    if (company) {
      const updatedCompany = new Company(
        company.id,
        company.name,
        company.taxNumber,
        input.sgkNumber && !company.sgkNumber
          ? input.sgkNumber
          : company.sgkNumber,
        input.iban && !company.iban ? input.iban : company.iban,
        company.city,
        company.industry,
        company.address,
        company.website,
        company.contactPerson,
        company.contactEmail,
        company.contactPhone,
        company.isVerified,
        company.isActive,
        company.createdAt,
        now,
      );
      await this.companyRepository.update(updatedCompany);
    }

    // Mark token as used
    token.markAsUsed(now);
    await this.employerTokenRepository.update(token);
  }
}
