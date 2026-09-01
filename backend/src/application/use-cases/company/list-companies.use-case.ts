import { Injectable } from '@nestjs/common';
import { ICompanyRepository } from '../../ports/company.repository.port';

@Injectable()
export class ListCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute() {
    const companies = await this.companyRepository.findAll();
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
