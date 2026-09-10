import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { IConfigProvider } from '../../ports/config-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

@Injectable()
export class GenerateApplicationFormUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly pdfCompiler: IPdfCompiler,
    private readonly config: IConfigProvider,
  ) {}

  // PDF compilation is synchronous for now; move heavy generation to a background job under load.
  async execute(
    internshipId: string,
    currentUserId: string,
    currentUserRole: string,
    currentUserDepartmentId?: string | null,
  ): Promise<Buffer> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    if (currentUserRole === 'STUDENT' && internship.studentId !== currentUserId) {
      throw new DomainException('FORBIDDEN', 'Access denied', 403);
    }
    if (
      internship.status === InternshipStatus.DRAFT ||
      internship.status === InternshipStatus.REVISION_REQUESTED
    ) {
      throw new DomainException(
        'INVALID_STATE',
        'Application form cannot be generated for unsubmitted drafts',
        409,
      );
    }

    const [student, company] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
    ]);
    if (!student || !company)
      throw new DomainException('INTERNAL_ERROR', 'Data integrity failure', 500);
    if (currentUserRole === 'ACADEMIC' || currentUserRole === 'ADMINISTRATIVE') {
      if (currentUserDepartmentId !== internship.departmentId || student.departmentId !== internship.departmentId) {
        throw new DomainException('FORBIDDEN', 'Department access denied', 403);
      }
    }

    const frontendUrls = await this.config.get<string>(
      'FRONTEND_URLS',
      'http://localhost:5173',
    );
    const verificationUrl = `${frontendUrls.split(',')[0].trim()}/verify/${internship.id}`;

    // Generate SVG QR code
    const qrSvg = await QRCode.toString(verificationUrl, { type: 'svg' });
    const qrFilename = `qr_${randomUUID()}.svg`;
    const qrFilePath = path.join(process.cwd(), 'templates', qrFilename);
    await fs.writeFile(qrFilePath, qrSvg, 'utf-8');

    const payload = {
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        email: student.email.toValue(),
      },
      company: {
        name: company.name,
        taxNumber: company.taxNumber,
        sgkNumber: company.sgkNumber || 'N/A',
      },
      internship: {
        startDate: internship.startDate.toISOString().slice(0, 10),
        endDate: internship.endDate.toISOString().slice(0, 10),
        status: internship.status,
      },
      signatures: {
        employerIp: internship.employerApprovalIp || 'PENDING',
        employerTimestamp:
          internship.employerApprovalTimestamp?.toISOString() || 'PENDING',
        commissionTimestamp:
          internship.commissionApprovalTimestamp?.toISOString() || 'PENDING',
      },
      qrCodeSvgPath: qrFilename,
      verificationUrl,
    };

    try {
      return await this.pdfCompiler.compile('basvuru_formu.typ', payload);
    } finally {
      await fs.rm(qrFilePath, { force: true }).catch(() => {});
    }
  }
}
