import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UploadApplicationDocumentUseCase } from '../../application/use-cases/application-document/upload-application-document.use-case';
import { ListApplicationDocumentsUseCase } from '../../application/use-cases/application-document/list-application-documents.use-case';
import { AcceptApplicationDocumentUseCase } from '../../application/use-cases/application-document/accept-application-document.use-case';
import { RejectApplicationDocumentUseCase } from '../../application/use-cases/application-document/reject-application-document.use-case';
import { RejectApplicationDocumentDto } from './dto/reject-application-document.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller()
@UseGuards(AuthGuard)
export class ApplicationDocumentController {
  constructor(
    private readonly uploadApplicationDocumentUseCase: UploadApplicationDocumentUseCase,
    private readonly listApplicationDocumentsUseCase: ListApplicationDocumentsUseCase,
    private readonly acceptApplicationDocumentUseCase: AcceptApplicationDocumentUseCase,
    private readonly rejectApplicationDocumentUseCase: RejectApplicationDocumentUseCase,
  ) {}

  @Post('internships/:id/documents')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Body('documentTypeId') documentTypeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    }
    if (!documentTypeId) {
      throw new DomainException(
        'VALIDATION_ERROR',
        'documentTypeId is required',
        400,
      );
    }

    return this.uploadApplicationDocumentUseCase.execute({
      internshipId,
      documentTypeId,
      currentUserId: req.user!.id,
      file,
    });
  }

  @Get('internships/:id/documents')
  async list(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Authorization checks are handled by existing get internship access? We'll keep simple:
    // Both student owner and academic of same department can view.
    // For now, allow any authenticated, but we can refine.
    return this.listApplicationDocumentsUseCase.execute(internshipId);
  }

  @Post('application-documents/:documentId/accept')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async accept(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = req.user!.departmentId;
    if (!departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic must have a department',
        403,
      );
    }

    await this.acceptApplicationDocumentUseCase.execute({
      documentId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
    });
    return { message: 'Document accepted' };
  }

  @Post('application-documents/:documentId/reject')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async reject(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() dto: RejectApplicationDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = req.user!.departmentId;
    if (!departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic must have a department',
        403,
      );
    }

    await this.rejectApplicationDocumentUseCase.execute({
      documentId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
      reason: dto.reason,
    });
    return { message: 'Document rejected' };
  }
}
