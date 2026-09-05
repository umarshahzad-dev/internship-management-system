import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { Internship } from '../../../domain/entities/internship.entity';
import { EmployerToken } from '../../../domain/entities/employer-token.entity';
import { EmployerTokenType } from '../../../domain/enums/employer-token-type.enum';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { IEmailSender } from '../../ports/email-sender.port';
import { IConfigProvider } from '../../ports/config-provider.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface SubmitInternshipInput {
  internshipId: string;
  currentUserId: string;
}

@Injectable()
export class SubmitInternshipUseCase {
  private readonly logger = new Logger(SubmitInternshipUseCase.name);

  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly emailSender: IEmailSender,
    private readonly config: IConfigProvider,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: SubmitInternshipInput): Promise<void> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }
    if (internship.studentId !== input.currentUserId) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }

    // 1. Advance state using domain method
    internship.submitToEmployer();
    await this.internshipRepository.update(internship);

    // 2. Generate employer token (72 hour expiry)
    const now = this.dateProvider.now();
    const plainToken = this.tokenGenerator.generateRandomToken(32);
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours

    const token = new EmployerToken(
      tokenHash,
      internship.id,
      EmployerTokenType.APPLICATION_APPROVAL,
      expiresAt,
      false,
      null,
      now,
    );
    await this.employerTokenRepository.create(token);

    // 3. Send email to employer (company contact email)
    const company = await this.companyRepository.findById(internship.companyId);
    if (!company) {
      throw new DomainException('NOT_FOUND', 'Company not found', 404);
    }

    const frontendUrls = await this.config.get<string>(
      'FRONTEND_URLS',
      'http://localhost:5173',
    );
    const frontendUrl = frontendUrls.split(',')[0].trim();
    const approvalLink = `${frontendUrl}/employer/approve/${plainToken}`;
    const recipientEmail = company.contactEmail;

    if (!recipientEmail) {
      this.logger.warn(
        `Company ${company.name} has no contact email. Approval link: ${approvalLink}`,
      );
      return;
    }

    try {
      await this.emailSender.send({
        to: recipientEmail,
        subject: 'Staj Başvurusu Onayı Gerekiyor',
        html: `<p>Öğrencinin staj başvurusu onayınızı bekliyor. SGK/IBAN bilgilerinizi girmek ve onaylamak için tıklayın: <a href="${approvalLink}">${approvalLink}</a></p>`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send employer approval email to ${recipientEmail}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
