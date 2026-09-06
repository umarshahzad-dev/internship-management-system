import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';
import { IPdfCompiler } from '../../ports/pdf-compiler.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GenerateZorunluStajBelgesiUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly pdfCompiler: IPdfCompiler,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(studentId: string): Promise<Buffer> {
    const student = await this.userRepository.findById(studentId);
    if (!student)
      throw new DomainException('NOT_FOUND', 'Student not found', 404);

    const now = this.dateProvider.now();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed: 0 = January, 8 = September
    const academicYear =
      currentMonth >= 8
        ? `${currentYear}-${currentYear + 1}`
        : `${currentYear - 1}-${currentYear}`;

    // Static department configuration for now; dynamic mapping can be added later.
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
    };

    return this.pdfCompiler.compile('zorunlu_staj_belgesi.typ', payload);
  }
}
