import { Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UpdateCompanyInput {
  companyId: string;
  name?: string;
  taxNumber?: string;
  sgkNumber?: string | null;
  iban?: string | null;
  city?: string | null;
  industry?: string | null;
  address?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateCompanyResult {
  id: string;
  name: string;
  taxNumber: string;
  sgkNumber: string | null;
  iban: string | null;
  city: string | null;
  industry: string | null;
  isVerified: boolean;
  isActive: boolean;
}

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: UpdateCompanyInput): Promise<UpdateCompanyResult> {
    const existing = await this.companyRepository.findById(input.companyId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Company not found', 404);
    }

    // If taxNumber changes, ensure it's valid and unique
    if (input.taxNumber && input.taxNumber !== existing.taxNumber) {
      const duplicate = await this.companyRepository.findByTaxNumber(
        input.taxNumber,
      );
      if (duplicate) {
        throw new DomainException('CONFLICT', 'Tax number already exists', 409);
      }
    }

    const now = this.dateProvider.now();
    const updatedCompany = new Company(
      existing.id,
      input.name ?? existing.name,
      input.taxNumber ?? existing.taxNumber,
      input.sgkNumber !== undefined ? input.sgkNumber : existing.sgkNumber,
      input.iban !== undefined ? input.iban : existing.iban,
      input.city !== undefined ? input.city : existing.city,
      input.industry !== undefined ? input.industry : existing.industry,
      input.address !== undefined ? input.address : existing.address,
      input.website !== undefined ? input.website : existing.website,
      input.contactPerson !== undefined
        ? input.contactPerson
        : existing.contactPerson,
      input.contactEmail !== undefined
        ? input.contactEmail
        : existing.contactEmail,
      input.contactPhone !== undefined
        ? input.contactPhone
        : existing.contactPhone,
      existing.isVerified,
      existing.isActive,
      existing.createdAt,
      now,
    );

    const saved = await this.companyRepository.update(updatedCompany);
    return {
      id: saved.id,
      name: saved.name,
      taxNumber: saved.taxNumber,
      sgkNumber: saved.sgkNumber,
      iban: saved.iban,
      city: saved.city,
      industry: saved.industry,
      isVerified: saved.isVerified,
      isActive: saved.isActive,
    };
  }
}
