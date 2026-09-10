import { Injectable } from '@nestjs/common';
import {
  ICompanyRepository,
  CompanyFilters,
} from '../../ports/company.repository.port';

export interface ListCompaniesInput {
  currentUserRole: string;
  search?: string;
  city?: string;
  industry?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CompanyListItem {
  id: string;
  name: string;
  taxNumber?: string;
  sgkNumber?: string | null;
  iban?: string | null;
  city: string | null;
  industry: string | null;
  isVerified: boolean;
  isActive: boolean;
}

@Injectable()
export class ListCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(input: ListCompaniesInput): Promise<CompanyListItem[]> {
    const filters: CompanyFilters = {};
    if (input.search) filters.search = input.search;
    if (input.city) filters.city = input.city;
    if (input.industry) filters.industry = input.industry;
    if (input.isActive !== undefined) filters.isActive = input.isActive;
    else if (input.currentUserRole !== 'ADMIN') filters.isActive = true;
    if (input.isVerified !== undefined) filters.isVerified = input.isVerified;

    const companies = await this.companyRepository.findAll(filters);
    return companies.map((company) => {
      const common = {
        id: company.id,
        name: company.name,
        city: company.city,
        industry: company.industry,
        isVerified: company.isVerified,
        isActive: company.isActive,
      };

      return input.currentUserRole === 'ADMIN'
        ? {
            ...common,
            taxNumber: company.taxNumber,
            sgkNumber: company.sgkNumber,
            iban: company.iban,
          }
        : common;
    });
  }
}
