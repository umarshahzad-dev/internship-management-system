import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface FindOrCreateCompanyInput {
  name: string;
  taxNumber: string;
}

export interface FindOrCreateCompanyResult {
  id: string;
  name: string;
  taxNumber: string;
  city: string;
  industry: string;
  isVerified: boolean;
  isActive: boolean;
}

@Injectable()
export class FindOrCreateCompanyUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: FindOrCreateCompanyInput,
  ): Promise<FindOrCreateCompanyResult> {
    const existing = await this.companyRepository.findByTaxNumber(
      input.taxNumber,
    );
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        taxNumber: existing.taxNumber,
        city: existing.city,
        industry: existing.industry,
        isVerified: existing.isVerified,
        isActive: existing.isActive,
      };
    }

    // For new company, city and industry are unknown; set defaults for now.
    // Future enhancement: enrich from external registry.
    const now = this.dateProvider.now();
    const company = new Company(
      randomUUID(),
      input.name,
      input.taxNumber,
      'Unknown',
      'Unknown',
      null,
      null,
      null,
      null,
      null,
      false,
      true,
      now,
      now,
    );

    const saved = await this.companyRepository.create(company);
    return {
      id: saved.id,
      name: saved.name,
      taxNumber: saved.taxNumber,
      city: saved.city,
      industry: saved.industry,
      isVerified: saved.isVerified,
      isActive: saved.isActive,
    };
  }
}
