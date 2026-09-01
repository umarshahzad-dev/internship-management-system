import { Company } from '../../domain/entities/company.entity';
import { CompanyEntity } from '../database/entities/company.entity';

export class CompanyMapper {
  static toDomain(entity: CompanyEntity): Company {
    return new Company(
      entity.id,
      entity.name,
      entity.taxNumber,
      entity.city,
      entity.industry,
      entity.address,
      entity.website,
      entity.contactPerson,
      entity.contactEmail,
      entity.contactPhone,
      entity.isVerified,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Company): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.taxNumber = domain.taxNumber;
    entity.city = domain.city;
    entity.industry = domain.industry;
    entity.address = domain.address;
    entity.website = domain.website;
    entity.contactPerson = domain.contactPerson;
    entity.contactEmail = domain.contactEmail;
    entity.contactPhone = domain.contactPhone;
    entity.isVerified = domain.isVerified;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
