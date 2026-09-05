import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { EmployerToken } from '../../../domain/entities/employer-token.entity';
import { EmployerTokenType } from '../../../domain/enums/employer-token-type.enum';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../ports/internship-status-history.repository.port';
import { IEmployerTokenRepository } from '../../ports/employer-token.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { IEmailSender } from '../../ports/email-sender.port';
import { IConfigProvider } from '../../ports/config-provider.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatusHistory } from '../../../domain/entities/internship-status-history.entity';

@Injectable()
export class CompleteInternshipUseCase {
  private readonly logger = new Logger(CompleteInternshipUseCase.name);

  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly historyRepository: IInternshipStatusHistoryRepository,
    private readonly employerTokenRepository: IEmployerTokenRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly emailSender: IEmailSender,
    private readonly config: IConfigProvider,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(internshipId: string, currentUserId: string): Promise<void> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    if (internship.studentId !== currentUserId)
      throw new DomainException('FORBIDDEN', 'Access denied', 403);

    const oldStatus = internship.status;
    const now = this.dateProvider.now();

    internship.completeOngoing(now);
    await this.internshipRepository.update(internship);

    const history = new InternshipStatusHistory(
      randomUUID(),
      internship.id,
      oldStatus,
      internship.status,
      null,
      currentUserId,
      now,
    );
    await this.historyRepository.create(history);

    // Generate Employer Evaluation Token (7 Days Expiry)
    const plainToken = this.tokenGenerator.generateRandomToken(32);
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const token = new EmployerToken(
      tokenHash,
      internship.id,
      EmployerTokenType.EVALUATION,
      expiresAt,
      false,
      null,
      now,
    );
    await this.employerTokenRepository.create(token);
    this.logger.log(`Employer evaluation token generated: ${plainToken}`);

    const company = await this.companyRepository.findById(internship.companyId);
    if (!company || !company.contactEmail) return;

    const frontendUrls = await this.config.get<string>(
      'FRONTEND_URLS',
      'http://localhost:5173',
    );
    const evaluationLink = `${frontendUrls.split(',')[0].trim()}/employer/evaluate/${plainToken}`;

    try {
      await this.emailSender.send({
        to: company.contactEmail,
        subject: 'Öğrenci Staj Değerlendirme Anketi',
        html: `<p>Öğrencinin staj süreci tamamlanmıştır. Değerlendirme anketini doldurmak için tıklayın: <a href="${evaluationLink}">${evaluationLink}</a></p>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send evaluation email`, error);
    }
  }
}
