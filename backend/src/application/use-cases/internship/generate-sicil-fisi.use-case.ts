import { Injectable } from '@nestjs/common';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GenerateSicilFisiUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly evaluationRepository: IEmployerEvaluationRepository,
    private readonly pdfCompiler: IPdfCompiler,
  ) {}

  async execute(
    internshipId: string,
    departmentId: string,
    role: string,
  ): Promise<Buffer> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);

    if (role !== 'ADMIN' && internship.departmentId !== departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Cannot access records outside your department',
        403,
      );
    }

    const [student, company, evaluation] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
      this.evaluationRepository.findByInternship(internship.id),
    ]);

    if (!student || !company)
      throw new DomainException(
        'INTERNAL_ERROR',
        'Data integrity failure',
        500,
      );
    if (!evaluation)
      throw new DomainException(
        'EVALUATION_MISSING',
        'Employer has not submitted an evaluation yet',
        404,
      );

    // Extract grades from our domain entity (grades are { criterion: { letter, score } })
    const grades = evaluation.grades || {};
    const getLetter = (key: string) => grades[key]?.letter || 'N/A';

    // Calculate total days based on start/end dates (basic difference)
    const start = new Date(internship.startDate);
    const end = new Date(internship.endDate);
    const totalDays = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const payload = {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        department: 'Yazılım Mühendisliği', // static; replace with dynamic if available
        number: student.studentNumber || 'N/A',
        classYear: 'N/A',
        birthYear: 'N/A',
        birthPlace: 'N/A',
      },
      internship: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        workedDays: totalDays.toString(),
        absentDays: '0',
        departmentsWorked: 'Yazılım Geliştirme',
      },
      company: {
        supervisorName: evaluation.employerName || 'Dijital Onay',
      },
      evaluation: {
        attendance: getLetter('attendance'),
        effort: getLetter('effort'),
        timeliness: getLetter('timeliness'),
        behavior: getLetter('conduct'), // our domain uses 'conduct' for behavior
        teamwork: getLetter('teamwork'),
        ethics: getLetter('ethics'),
        learning: getLetter('self_improvement'), // mapped to learning
        innovation: getLetter('innovation') || 'N/A',
        ipAddress: 'Bilinmiyor', // no IP stored in evaluation
        timestamp: evaluation.submittedAt
          ? new Date(evaluation.submittedAt)
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ')
          : 'N/A',
      },
    };

    return this.pdfCompiler.compile('sicil_fisi.typ', payload);
  }
}
