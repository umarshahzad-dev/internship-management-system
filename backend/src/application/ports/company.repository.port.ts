import { Company } from '../../domain/entities/company.entity';

export interface CompanyFilters {
  search?: string;
  city?: string;
  industry?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export abstract class ICompanyRepository {
  abstract findById(id: string): Promise<Company | null>;
  abstract findAll(filters?: CompanyFilters): Promise<Company[]>;
  abstract findByTaxNumber(taxNumber: string): Promise<Company | null>;
  abstract create(company: Company): Promise<Company>;
  abstract update(company: Company): Promise<Company>;
}
