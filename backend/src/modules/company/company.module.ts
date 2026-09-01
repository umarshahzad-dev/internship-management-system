import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CompanyController } from './company.controller';
import { ListCompaniesUseCase } from '../../application/use-cases/company/list-companies.use-case';
import { CreateCompanyUseCase } from '../../application/use-cases/company/create-company.use-case';
import { FindOrCreateCompanyUseCase } from '../../application/use-cases/company/find-or-create-company.use-case';
import { CompanyRepository } from '../../infrastructure/repositories/company.repository';
import { CompanyEntity } from '../../infrastructure/database/entities/company.entity';
import { ICompanyRepository } from '../../application/ports/company.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [
    { provide: ICompanyRepository, useClass: CompanyRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    ListCompaniesUseCase,
    CreateCompanyUseCase,
    FindOrCreateCompanyUseCase,
  ],
  exports: [ICompanyRepository],
})
export class CompanyModule {}
