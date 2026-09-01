import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Company } from '../../domain/entities/company.entity';
import {
  ICompanyRepository,
  CompanyFilters,
} from '../../application/ports/company.repository.port';
import { CompanyEntity } from '../database/entities/company.entity';
import { CompanyMapper } from '../mappers/company.mapper';

@Injectable()
export class CompanyRepository extends ICompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { id } });
    return entity ? CompanyMapper.toDomain(entity) : null;
  }

  async findAll(filters?: CompanyFilters): Promise<Company[]> {
    const where: any = {};
    if (filters?.search) {
      where.name = ILike(`%${filters.search}%`);
    }
    if (filters?.city) {
      where.city = ILike(`%${filters.city}%`);
    }
    if (filters?.industry) {
      where.industry = ILike(`%${filters.industry}%`);
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    const entities = await this.companyRepository.find({
      where,
      order: { name: 'ASC' },
    });
    return entities.map(CompanyMapper.toDomain);
  }

  async findByTaxNumber(taxNumber: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({
      where: { taxNumber },
    });
    return entity ? CompanyMapper.toDomain(entity) : null;
  }

  async create(company: Company): Promise<Company> {
    const entity = CompanyMapper.toPersistence(company);
    const saved = await this.companyRepository.save(entity);
    return CompanyMapper.toDomain(saved);
  }

  async update(company: Company): Promise<Company> {
    const entity = CompanyMapper.toPersistence(company);
    await this.companyRepository.update({ id: company.id }, entity);
    const updated = await this.companyRepository.findOne({
      where: { id: company.id },
    });
    return updated ? CompanyMapper.toDomain(updated) : company;
  }
}
