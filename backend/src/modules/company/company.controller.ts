import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { ListCompaniesUseCase } from '../../application/use-cases/company/list-companies.use-case';
import { CreateCompanyUseCase } from '../../application/use-cases/company/create-company.use-case';
import { UpdateCompanyUseCase } from '../../application/use-cases/company/update-company.use-case';
import { DeactivateCompanyUseCase } from '../../application/use-cases/company/deactivate-company.use-case';
import { VerifyCompanyUseCase } from '../../application/use-cases/company/verify-company.use-case';
import { ImportCompaniesUseCase } from '../../application/use-cases/company/import-companies.use-case';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserRole } from '../../domain/value-objects/role.vo';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deactivateCompanyUseCase: DeactivateCompanyUseCase,
    private readonly verifyCompanyUseCase: VerifyCompanyUseCase,
    private readonly importCompaniesUseCase: ImportCompaniesUseCase,
  ) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('industry') industry?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    return this.listCompaniesUseCase.execute({
      search,
      city,
      industry,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
    });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
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

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompanyUseCase.execute({
      companyId: id,
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

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deactivateCompanyUseCase.execute(id);
    return { message: 'Company deactivated' };
  }

  @Post(':id/verify')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async verify(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.verifyCompanyUseCase.execute(id);
    return { message: 'Company verified' };
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importCompanies(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.importCompaniesUseCase.execute(file.buffer);
  }
}
