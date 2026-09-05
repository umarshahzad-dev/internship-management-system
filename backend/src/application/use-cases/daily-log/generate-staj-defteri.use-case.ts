import { Injectable } from '@nestjs/common';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

@Injectable()
export class GenerateStajDefteriUseCase {
  constructor(
    private readonly dailyLogRepository: IDailyLogRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly pdfCompiler: IPdfCompiler,
  ) {}

  async execute(internshipId: string, currentUserId: string): Promise<Buffer> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    if (internship.studentId !== currentUserId)
      throw new DomainException('FORBIDDEN', 'Access denied', 403);

    if (
      internship.status !== InternshipStatus.EVALUATION &&
      internship.status !== InternshipStatus.GRADED &&
      internship.status !== InternshipStatus.COMPLETED
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Staj Defteri can only be generated after the internship is completed',
        409,
      );
    }

    const [user, company, logs] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
      this.dailyLogRepository.findByInternship(internshipId),
    ]);

    if (!user || !company)
      throw new DomainException(
        'INTERNAL_ERROR',
        'Data integrity failure',
        500,
      );

    const payload = {
      student: {
        firstName: user.firstName,
        lastName: user.lastName,
        studentNumber: user.studentNumber,
      },
      company: { name: company.name, city: company.city },
      internship: {
        startDate: internship.startDate.toISOString().slice(0, 10),
        endDate: internship.endDate.toISOString().slice(0, 10),
      },
      logs: logs.map((l) => ({
        date: l.logDate.toISOString().slice(0, 10),
        content: l.content,
      })),
    };

    return this.pdfCompiler.compile('staj_defteri.typ', payload);
  }
}
