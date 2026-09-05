import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as Papa from 'papaparse';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { VknValidator } from '../../../common/utils/vkn-validator';

export interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
}

@Injectable()
export class ImportCompaniesUseCase {
  private readonly logger = new Logger(ImportCompaniesUseCase.name);

  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(fileBuffer: Buffer): Promise<ImportResult> {
    const csvContent = fileBuffer.toString('utf-8');
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;

    for (let i = 0; i < parseResult.data.length; i++) {
      const rawRow = parseResult.data[i];
      const rowNumber = i + 2; // header is row 1

      try {
        // Trim all cell values
        const row: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawRow)) {
          row[key] = String(value).trim();
        }

        const name = row['name'];
        const taxNumber = row['taxnumber'] || row['tax_number'];
        const sgkNumber = row['sgknumber'] || row['sgk_number'] || null;
        const iban = row['iban'] || null;
        const city = row['city'] || null;
        const industry = row['industry'] || null;
        const address = row['address'] || null;
        const website = row['website'] || null;
        const contactPerson =
          row['contactperson'] || row['contact_person'] || null;
        const contactEmail =
          row['contactemail'] || row['contact_email'] || null;
        const contactPhone =
          row['contactphone'] || row['contact_phone'] || null;

        if (!name) throw new Error('Missing name');
        if (!taxNumber) throw new Error('Missing tax number');
        if (
          !/^[0-9]{10}$/.test(taxNumber) ||
          !VknValidator.isValid(taxNumber)
        ) {
          throw new Error('Invalid tax number');
        }

        const existing =
          await this.companyRepository.findByTaxNumber(taxNumber);
        const now = this.dateProvider.now();

        if (existing) {
          // Update existing company with non-empty fields, keep isVerified/isActive
          const updated = new Company(
            existing.id,
            name || existing.name,
            existing.taxNumber,
            sgkNumber || existing.sgkNumber,
            iban || existing.iban,
            city || existing.city,
            industry || existing.industry,
            address || existing.address,
            website || existing.website,
            contactPerson || existing.contactPerson,
            contactEmail || existing.contactEmail,
            contactPhone || existing.contactPhone,
            existing.isVerified,
            existing.isActive,
            existing.createdAt,
            now,
          );
          await this.companyRepository.update(updated);
        } else {
          const newCompany = new Company(
            randomUUID(),
            name,
            taxNumber,
            sgkNumber,
            iban,
            city,
            industry,
            address,
            website,
            contactPerson,
            contactEmail,
            contactPhone,
            false,
            true,
            now,
            now,
          );
          await this.companyRepository.create(newCompany);
        }

        imported++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ row: rowNumber, message });
      }
    }

    return { imported, errors };
  }
}
