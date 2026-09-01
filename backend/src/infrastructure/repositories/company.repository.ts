import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../domain/entities/company.entity';
import { ICompanyRepository } from '../../application/ports/company.repository.port';
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

  async findAll(): Promise<Company[]> {
    const entities = await this.companyRepository.find({
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
