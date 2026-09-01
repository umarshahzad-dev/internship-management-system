import { Injectable } from '@nestjs/common';
import {
  ICompanyRepository,
  CompanyFilters,
} from '../../ports/company.repository.port';

export interface ListCompaniesInput {
  search?: string;
  city?: string;
  industry?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CompanyListItem {
  id: string;
  name: string;
  taxNumber: string;
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
    if (input.isVerified !== undefined) filters.isVerified = input.isVerified;

    const companies = await this.companyRepository.findAll(filters);
    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      taxNumber: company.taxNumber,
      city: company.city,
      industry: company.industry,
      isVerified: company.isVerified,
      isActive: company.isActive,
    }));
  }
}
