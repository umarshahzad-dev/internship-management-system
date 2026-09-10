import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDepartmentRepository } from '../../ports/department.repository.port';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { IConfigProvider } from '../../ports/config-provider.port';
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
    private readonly evaluationRepository: IEmployerEvaluationRepository,
    private readonly pdfCompiler: IPdfCompiler,
    private readonly config: IConfigProvider,
  ) {}

  // PDF compilation is synchronous for now; move heavy generation to a background job under load.
  async execute(
    internshipId: string,
    currentUserId: string,
    role: string,
  ): Promise<Buffer> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    if (role === 'STUDENT' && internship.studentId !== currentUserId) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }
    if (role === 'ACADEMIC') {
      const academic = await this.userRepository.findById(currentUserId);
      if (!academic || academic.departmentId !== internship.departmentId) {
        throw new DomainException('FORBIDDEN', 'Department access denied', 403);
      }
    }
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

    const [user, company, department, logs, evaluation] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
      this.departmentRepository.findById(internship.departmentId),
      this.dailyLogRepository.findByInternship(internshipId),
      this.evaluationRepository.findByInternship(internshipId),
    ]);
    if (!user || !company || !department)
      throw new DomainException(
        'INTERNAL_ERROR',
        'Data integrity failure',
        500,
      );

    const frontendUrls = await this.config.get<string>(
      'FRONTEND_URLS',
      'http://localhost:5173',
    );
    const verificationUrl = `${frontendUrls.split(',')[0].trim()}/verify/${internship.id}`;

    const qrSvg = await QRCode.toString(verificationUrl, { type: 'svg' });
    const qrFilename = `qr_${randomUUID()}.svg`;
    const qrFilePath = path.join(process.cwd(), 'templates', qrFilename);
    await fs.writeFile(qrFilePath, qrSvg, 'utf-8');

    const payload = {
      student: {
        name: `${user.firstName} ${user.lastName}`,
        number: user.studentNumber || 'N/A',
        department: department.name,
      },
      company: {
        name: company.name,
        address: company.address || 'Adres belirtilmedi',
        supervisorName: evaluation?.employerName || 'İş Yeri Amiri',
        supervisorTitle: 'İş Yeri Amiri',
      },
      internship: {
        startDate: internship.startDate.toISOString().slice(0, 10),
        endDate: internship.endDate.toISOString().slice(0, 10),
        totalDays: logs.length.toString(),
      },
      evaluation: {
        timestamp: internship.employerLogsApprovedAt
          ? `Digitally Signed by Employer on ${internship.employerLogsApprovedAt
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ')}`
          : 'ONAY BEKLİYOR',
        ipAddress: internship.employerApprovalIp || 'SİSTEM',
      },
      qrCodeSvgPath: qrFilename,
      verificationUrl,
      logs: logs.map((log) => ({
        date: log.logDate.toISOString().slice(0, 10),
        department: 'Yazılım',
        content: log.content,
      })),
    };

    try {
      return await this.pdfCompiler.compile('staj_defteri.typ', payload);
    } finally {
      await fs.rm(qrFilePath, { force: true }).catch(() => {});
    }
  }
}
