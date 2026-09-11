import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { IReportRepository } from '../../ports/report.repository.port';

@Injectable()
export class GenerateAdminReportUseCase {
  constructor(private readonly reports: IReportRepository) {}

  async execute(role: string, departmentId?: string, termId?: string): Promise<Buffer> {
    if (role !== 'ADMIN') throw new DomainException('FORBIDDEN', 'Only administrators can generate reports', 403);
    const data = await this.reports.getAdminReportData(departmentId, termId);
    const workbook = new ExcelJS.Workbook();
    this.addSheet(workbook, 'Stajlar', ['Öğrenci Adı', 'Öğrenci No', 'Bölüm', 'Firma Adı', 'Başlangıç', 'Bitiş', 'Durum', 'Akademik Not'], data.internships.map((row) => [row.studentName, row.studentNumber, row.departmentName, row.companyName, row.startDate, row.endDate, row.status, row.academicGrade]));
    this.addSheet(workbook, 'Kullanıcılar', ['Ad Soyad', 'Email', 'Rol', 'Bölüm', 'Aktif mi'], data.users.map((row) => [row.fullName, row.email, row.role, row.departmentName, row.isActive ? 'Evet' : 'Hayır']));
    this.addSheet(workbook, 'Firmalar', ['Firma Adı', 'Vergi No', 'SGK No', 'Sektör', 'Şehir'], data.companies.map((row) => [row.name, row.taxNumber, row.sgkNumber, row.industry, row.city]));
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private addSheet(workbook: ExcelJS.Workbook, name: string, headers: string[], rows: unknown[][]) {
    const sheet = workbook.addWorksheet(name);
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B213F' } };
    rows.forEach((row) => sheet.addRow(row));
    headers.forEach((header, index) => {
      const longest = Math.max(header.length, ...rows.map((row) => String(row[index] ?? '').length));
      sheet.getColumn(index + 1).width = Math.min(48, Math.max(14, longest + 2));
    });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(65 + headers.length - 1)}${Math.max(1, rows.length + 1)}` };
  }
}
