import { Injectable } from '@nestjs/common';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDepartmentRepository } from '../../ports/department.repository.port';
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
    private readonly departmentRepository: IDepartmentRepository,
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

    const [user, company, department, logs] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
      this.departmentRepository.findById(internship.departmentId),
      this.dailyLogRepository.findByInternship(internshipId),
    ]);

    if (!user || !company || !department)
      throw new DomainException(
        'INTERNAL_ERROR',
        'Data integrity failure',
        500,
      );

    // Calculate total working days (basic difference; can be improved with holiday logic)
    const start = new Date(internship.startDate);
    const end = new Date(internship.endDate);
    const totalDays = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const payload = {
      student: {
        name: `${user.firstName} ${user.lastName}`,
        number: user.studentNumber || 'N/A',
        department: department.name,
      },
      company: {
        name: company.name,
        address: company.address || 'Adres belirtilmedi',
        supervisorName: company.contactPerson || 'İş Yeri Amiri',
        supervisorTitle: 'İş Yeri Amiri',
      },
      internship: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        totalDays: totalDays.toString(),
      },
      logs: logs.map((log) => ({
        date: log.logDate.toISOString().slice(0, 10),
        department: 'Yazılım', // static; could be dynamic if log has department field
        content: log.content,
      })),
    };

    return this.pdfCompiler.compile('staj_defteri.typ', payload);
  }
}
