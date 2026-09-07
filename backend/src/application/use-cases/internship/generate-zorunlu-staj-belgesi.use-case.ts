import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../../ports/user.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { IConfigProvider } from '../../ports/config-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GenerateZorunluStajBelgesiUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly pdfCompiler: IPdfCompiler,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  async execute(studentId: string): Promise<Buffer> {
    const student = await this.userRepository.findById(studentId);
    if (!student)
      throw new DomainException('NOT_FOUND', 'Student not found', 404);

    const now = this.dateProvider.now();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const academicYear =
      currentMonth >= 8
        ? `${currentYear}-${currentYear + 1}`
        : `${currentYear - 1}-${currentYear}`;

    const frontendUrls = await this.config.get<string>(
      'FRONTEND_URLS',
      'http://localhost:5173',
    );
    const verificationUrl = `${frontendUrls.split(',')[0].trim()}/verify/zorunlu-staj/${student.id}`;

    // Generate SVG QR code
    const qrSvg = await QRCode.toString(verificationUrl, { type: 'svg' });
    const qrFilename = `qr_${randomUUID()}.svg`;
    const qrFilePath = path.join(process.cwd(), 'templates', qrFilename);
    await fs.writeFile(qrFilePath, qrSvg, 'utf-8');

    const departmentConfig = {
      name: 'Yazılım Mühendisliği',
      headName: 'Doç. Dr. İsmail KOÇ',
      headTitle: 'Bölüm Başkanı',
    };

    const payload = {
      department: departmentConfig,
      student: {
        name: `${student.firstName} ${student.lastName}`,
        number: student.studentNumber || 'N/A',
      },
      academicYear,
      date: now.toLocaleDateString('tr-TR'),
      qrCodeSvgPath: qrFilename,
      verificationUrl,
    };

    try {
      return await this.pdfCompiler.compile(
        'zorunlu_staj_belgesi.typ',
        payload,
      );
    } finally {
      await fs.rm(qrFilePath, { force: true }).catch(() => {});
    }
  }
}
