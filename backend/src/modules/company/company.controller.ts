import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { documentUploadOptions } from '../../common/files/upload-options';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
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
import { paginate } from '../../common/pagination/paginate';

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

  /** Downloads the UTF-8 BOM CSV template used by the Admin import dialog. */
  @Get('template-csv')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  templateCsv(@Res() res: import('express').Response) {
    const csv = '\uFEFFFirma Adı,Vergi Numarası,SGK Numarası,IBAN,Şehir,Sektör,Adres,Web Sitesi,İrtibat Kişisi,İrtibat E-postası,İrtibat Telefonu\nÖrnek Teknoloji A.Ş.,1234567890,SGK123,TR000000000000000000000000,Konya,Yazılım,Selçuklu,https://example.com,Ayşe Yılmaz,ayse@example.com,+903222222222\n';
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="firma_sablonu.csv"' }); res.send(csv);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC, UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('industry') industry?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return paginate(await this.listCompaniesUseCase.execute({
      currentUserRole: req.user!.role,
      search,
      city,
      industry,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
    }), page, pageSize);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompanyUseCase.execute({
      name: dto.name,
      taxNumber: dto.taxNumber,
      sgkNumber: dto.sgkNumber,
      iban: dto.iban,
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
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompanyUseCase.execute({
      companyId: id,
      name: dto.name,
      taxNumber: dto.taxNumber,
      sgkNumber: dto.sgkNumber,
      iban: dto.iban,
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
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deactivateCompanyUseCase.execute(id);
    return { message: 'Company deactivated' };
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async verify(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.verifyCompanyUseCase.execute(id);
    return { message: 'Company verified' };
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  async importCompanies(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.importCompaniesUseCase.execute(file.buffer);
  }
}
