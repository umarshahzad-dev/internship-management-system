import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CompanyController } from './company.controller';
import { ListCompaniesUseCase } from '../../application/use-cases/company/list-companies.use-case';
import { CreateCompanyUseCase } from '../../application/use-cases/company/create-company.use-case';
import { UpdateCompanyUseCase } from '../../application/use-cases/company/update-company.use-case';
import { DeactivateCompanyUseCase } from '../../application/use-cases/company/deactivate-company.use-case';
import { VerifyCompanyUseCase } from '../../application/use-cases/company/verify-company.use-case';
import { ImportCompaniesUseCase } from '../../application/use-cases/company/import-companies.use-case';
import { CompanyRepository } from '../../infrastructure/repositories/company.repository';
import { CompanyEntity } from '../../infrastructure/database/entities/company.entity';
import { ICompanyRepository } from '../../application/ports/company.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [
    { provide: ICompanyRepository, useClass: CompanyRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    ListCompaniesUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeactivateCompanyUseCase,
    VerifyCompanyUseCase,
    ImportCompaniesUseCase,
    RolesGuard,
  ],
  exports: [ICompanyRepository],
})
export class CompanyModule {}
