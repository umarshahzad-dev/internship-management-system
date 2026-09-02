import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { ListDocumentTypesUseCase } from '../../application/use-cases/document-type/list-document-types.use-case';
import { CreateDocumentTypeUseCase } from '../../application/use-cases/document-type/create-document-type.use-case';
import { UpdateDocumentTypeUseCase } from '../../application/use-cases/document-type/update-document-type.use-case';
import { DeleteDocumentTypeUseCase } from '../../application/use-cases/document-type/delete-document-type.use-case';
import { UploadTemplateUseCase } from '../../application/use-cases/document-type/upload-template.use-case';
import { DownloadTemplateUseCase } from '../../application/use-cases/document-type/download-template.use-case';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller('document-types')
@UseGuards(AuthGuard)
export class DocumentTypeController {
  constructor(
    private readonly listDocumentTypesUseCase: ListDocumentTypesUseCase,
    private readonly createDocumentTypeUseCase: CreateDocumentTypeUseCase,
    private readonly updateDocumentTypeUseCase: UpdateDocumentTypeUseCase,
    private readonly deleteDocumentTypeUseCase: DeleteDocumentTypeUseCase,
    private readonly uploadTemplateUseCase: UploadTemplateUseCase,
    private readonly downloadTemplateUseCase: DownloadTemplateUseCase,
  ) {}

  private getDepartmentId(req: AuthenticatedRequest): string {
    if (req.user?.role === UserRole.ADMIN) {
      const dept = req.headers['x-department-id'];
      if (!dept) {
        throw new DomainException(
          'VALIDATION_ERROR',
          'X-Department-Id header is required for admin',
          400,
        );
      }
      return dept as string;
    }
    if (!req.user?.departmentId) {
      throw new DomainException('FORBIDDEN', 'User has no department', 403);
    }
    return req.user.departmentId;
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    return this.listDocumentTypesUseCase.execute(departmentId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateDocumentTypeDto) {
    return this.createDocumentTypeUseCase.execute({
      departmentId: dto.departmentId,
      name: dto.name,
      description: dto.description,
      isRequired: dto.isRequired,
      allowedFileTypes: dto.allowedFileTypes,
      maxFileSize: dto.maxFileSize,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDocumentTypeDto,
  ) {
    return this.updateDocumentTypeUseCase.execute({
      documentTypeId: id,
      name: dto.name,
      description: dto.description,
      isRequired: dto.isRequired,
      allowedFileTypes: dto.allowedFileTypes,
      maxFileSize: dto.maxFileSize,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteDocumentTypeUseCase.execute(id);
    return { message: 'Document type deleted' };
  }

  @Post(':id/template')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    }
    return this.uploadTemplateUseCase.execute(id, file);
  }

  @Get(':id/template')
  async downloadTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.downloadTemplateUseCase.execute(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="template.pdf"',
    });
    res.send(buffer);
  }
}
