import { Injectable } from '@nestjs/common';
import {
  IReportRepository,
  InternshipReportFilter,
  InternshipReportRow,
} from '../../ports/report.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GenerateInternshipCsvUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(
    role: string,
    filters: InternshipReportFilter,
  ): Promise<string> {
    if (role !== 'ADMIN') {
      throw new DomainException(
        'FORBIDDEN',
        'Only administrators can generate reports',
        403,
      );
    }

    const data = await this.reportRepository.getInternshipData(filters);

    const headers = [
      'Öğrenci No',
      'Ad Soyad',
      'Bölüm',
      'Şirket',
      'Başlangıç',
      'Bitiş',
      'Durum',
      'İşveren Puanı',
    ];
    const csvRows: string[] = [headers.join(',')];

    for (const row of data) {
      const values = [
        this.escapeCsv(row.studentNumber || 'N/A'),
        this.escapeCsv(row.studentName || 'N/A'),
        this.escapeCsv(row.departmentName || 'N/A'),
        this.escapeCsv(row.companyName || 'N/A'),
        this.escapeCsv(row.startDate || 'N/A'),
        this.escapeCsv(row.endDate || 'N/A'),
        this.escapeCsv(row.status || 'N/A'),
        this.escapeCsv(row.employerGrade || 'N/A'),
      ];
      csvRows.push(values.join(','));
    }

    return '\uFEFF' + csvRows.join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }
}
