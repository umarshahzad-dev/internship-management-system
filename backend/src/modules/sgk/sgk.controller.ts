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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ) {}

  private getDepartmentId(req: AuthenticatedRequest): string {
    // Academic and Administrative both have departmentId from JWT/session
    if (!req.user?.departmentId) {
      throw new DomainException('FORBIDDEN', 'User has no department', 403);
    }
    return req.user.departmentId;
  }

  @Get('sgk')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async list(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    return this.listSgkRecordsUseCase.execute(departmentId);
  }

  @Get('sgk/department')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async listByDepartment(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    return this.listSgkRecordsUseCase.execute(departmentId);
  }

  @Post('internships/:id/sgk')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  async createRecord(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = this.getDepartmentId(req);
    return this.createSgkRecordUseCase.execute({
      internshipId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
    });
  }

  @Post('sgk/:id/upload')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    }
    const departmentId = this.getDepartmentId(req);
    return this.uploadSgkDocumentUseCase.execute({
      sgkTrackingId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
      file,
    });
  }

  @Patch('sgk/:id/status')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard, CsrfGuard)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @Body() dto: UpdateSgkStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = this.getDepartmentId(req);
    return this.updateSgkStatusUseCase.execute({
      sgkTrackingId,
      newStatus: dto.status,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
    });
  }

  @Get('sgk/:id/history')
  @Roles(UserRole.ACADEMIC, UserRole.ADMINISTRATIVE)
  @UseGuards(RolesGuard)
  async history(
    @Param('id', new ParseUUIDPipe()) sgkTrackingId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = this.getDepartmentId(req);
    return this.getSgkHistoryUseCase.execute(sgkTrackingId, departmentId);
  }

  @Post('internships/:id/transition-to-ongoing')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async transitionToOngoing(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const departmentId = this.getDepartmentId(req);
    await this.transitionToOngoingUseCase.execute({
      internshipId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
    });
    return { message: 'Internship started (ONGOING)' };
  }
}
