import { Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeactivateCompanyUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(companyId: string): Promise<void> {
    const existing = await this.companyRepository.findById(companyId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Company not found', 404);
    }

    const now = this.dateProvider.now();
    const deactivated = new Company(
      existing.id,
      existing.name,
      existing.taxNumber,
      existing.sgkNumber,
      existing.iban,
      existing.city,
      existing.industry,
      existing.address,
      existing.website,
      existing.contactPerson,
      existing.contactEmail,
      existing.contactPhone,
      existing.isVerified,
      false,
      existing.createdAt,
      now,
    );
    await this.companyRepository.update(deactivated);
  }
}
