import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface CreateCompanyInput {
  name: string;
  taxNumber: string;
  city: string;
  industry: string;
  address?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface CreateCompanyResult {
  id: string;
  name: string;
  taxNumber: string;
  city: string;
  industry: string;
  isVerified: boolean;
  isActive: boolean;
}

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateCompanyInput): Promise<CreateCompanyResult> {
    const existing = await this.companyRepository.findByTaxNumber(
      input.taxNumber,
    );
    if (existing) {
      throw new DomainException(
        'CONFLICT',
        'Company with this tax number already exists',
        409,
      );
    }

    const now = this.dateProvider.now();
    const company = new Company(
      randomUUID(),
      input.name,
      input.taxNumber,
      input.city,
      input.industry,
      input.address ?? null,
      input.website ?? null,
      input.contactPerson ?? null,
      input.contactEmail ?? null,
      input.contactPhone ?? null,
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
