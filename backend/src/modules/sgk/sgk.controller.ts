import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { pdfUploadOptions } from '../../common/files/upload-options';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { CreateSgkRecordUseCase } from '../../application/use-cases/sgk/create-sgk-record.use-case';
import { ListSgkRecordsUseCase } from '../../application/use-cases/sgk/list-sgk-records.use-case';
import { UploadSgkDocumentUseCase } from '../../application/use-cases/sgk/upload-sgk-document.use-case';
import { UpdateSgkStatusUseCase } from '../../application/use-cases/sgk/update-sgk-status.use-case';
import { GetSgkHistoryUseCase } from '../../application/use-cases/sgk/get-sgk-history.use-case';
import { TransitionToOngoingUseCase } from '../../application/use-cases/sgk/transition-to-ongoing.use-case';
import { UpdateSgkStatusDto } from './dto/update-sgk-status.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DownloadSgkDocumentUseCase } from '../../application/use-cases/sgk/download-sgk-document.use-case';
import { Response } from 'express';
import { paginate } from '../../common/pagination/paginate';

@Controller()
@UseGuards(AuthGuard)
export class SgkController {
  constructor(
    private readonly createSgkRecordUseCase: CreateSgkRecordUseCase,
    private readonly listSgkRecordsUseCase: ListSgkRecordsUseCase,
    private readonly uploadSgkDocumentUseCase: UploadSgkDocumentUseCase,
    private readonly updateSgkStatusUseCase: UpdateSgkStatusUseCase,
    private readonly getSgkHistoryUseCase: GetSgkHistoryUseCase,
    private readonly transitionToOngoingUseCase: TransitionToOngoingUseCase,
    private readonly downloadSgkDocumentUseCase: DownloadSgkDocumentUseCase,
  ) {}

  private getDepartmentId(req: AuthenticatedRequest): string {
    if (!req.user?.departmentId)
      throw new DomainException('FORBIDDEN', 'User has no department', 403);
    return req.user.departmentId;
  }

  @Get('sgk')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async list(@Req() req: AuthenticatedRequest, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return paginate(await this.listSgkRecordsUseCase.execute(this.getDepartmentId(req)), page, pageSize);
  }

  @Get('sgk/department')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async listByDepartment(@Req() req: AuthenticatedRequest, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return paginate(await this.listSgkRecordsUseCase.execute(this.getDepartmentId(req)), page, pageSize);
  }

  @Post('internships/:id/sgk')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  async createRecord(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.createSgkRecordUseCase.execute({
      internshipId,
      userId: req.user!.id,
      departmentId: this.getDepartmentId(req),
    });
  }

  @Post('sgk/:id/upload')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async uploadDocument(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file)
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    return this.uploadSgkDocumentUseCase.execute({
      sgkTrackingId,
      userId: req.user!.id,
      departmentId: this.getDepartmentId(req),
      file,
    });
  }

  /** Canonical document endpoint used by the institutional workflow table. */
  @Post('sgk/:id/document')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async uploadDocumentCanonical(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.uploadDocument(sgkTrackingId, file, req);
  }

  @Get('sgk/:id/document')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async downloadDocument(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const result = await this.downloadSgkDocumentUseCase.execute(id, this.getDepartmentId(req));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${result.filename}"`, 'Content-Length': result.buffer.length.toString() });
    res.end(result.buffer);
  }

  @Patch('sgk/:id/status')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @Body() dto: UpdateSgkStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.updateSgkStatusUseCase.execute({
      sgkTrackingId,
      newStatus: dto.status,
      userId: req.user!.id,
      departmentId: this.getDepartmentId(req),
    });
  }

  @Get('sgk/:id/history')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async history(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getSgkHistoryUseCase.execute(
      sgkTrackingId,
      this.getDepartmentId(req),
    );
  }

  @Post('internships/:id/transition-to-ongoing')
  @Roles(UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  async transitionToOngoing(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.transitionToOngoingUseCase.execute({
      internshipId,
      userId: req.user!.id,
      departmentId: this.getDepartmentId(req),
    });
    return { message: 'Internship started (ONGOING)' };
  }
}
