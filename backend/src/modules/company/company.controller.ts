import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ListCompaniesUseCase } from '../../application/use-cases/company/list-companies.use-case';
import { CreateCompanyUseCase } from '../../application/use-cases/company/create-company.use-case';
import { FindOrCreateCompanyUseCase } from '../../application/use-cases/company/find-or-create-company.use-case';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FindOrCreateCompanyDto } from './dto/find-or-create-company.dto';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly findOrCreateCompanyUseCase: FindOrCreateCompanyUseCase,
  ) {}

  @Get()
  async list() {
    return this.listCompaniesUseCase.execute();
  }

  @Post()
  @UseGuards(CsrfGuard)
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompanyUseCase.execute({
      name: dto.name,
      taxNumber: dto.taxNumber,
      city: dto.city,
      industry: dto.industry,
      address: dto.address,
      website: dto.website,
      contactPerson: dto.contactPerson,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
    });
  }

  @Post('find-or-create')
  @UseGuards(CsrfGuard)
  async findOrCreate(@Body() dto: FindOrCreateCompanyDto) {
    return this.findOrCreateCompanyUseCase.execute({
      name: dto.name,
      taxNumber: dto.taxNumber,
    });
  }
}
