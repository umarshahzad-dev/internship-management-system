import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { CreateDraftInternshipUseCase } from '../../application/use-cases/internship/create-draft-internship.use-case';
import { ListInternshipsUseCase } from '../../application/use-cases/internship/list-internships.use-case';
import { GetInternshipUseCase } from '../../application/use-cases/internship/get-internship.use-case';
import { UpdateDraftInternshipUseCase } from '../../application/use-cases/internship/update-draft-internship.use-case';
import { SubmitInternshipUseCase } from '../../application/use-cases/internship/submit-internship.use-case';
import { WithdrawInternshipUseCase } from '../../application/use-cases/internship/withdraw-internship.use-case';
import { ApproveInternshipUseCase } from '../../application/use-cases/internship/approve-internship.use-case';
import { RejectInternshipUseCase } from '../../application/use-cases/internship/reject-internship.use-case';
import { RequestRevisionInternshipUseCase } from '../../application/use-cases/internship/request-revision-internship.use-case';
import { GetInternshipHistoryUseCase } from '../../application/use-cases/internship/get-internship-history.use-case';
import { CompleteInternshipUseCase } from '../../application/use-cases/internship/complete-internship.use-case';
import { CreateDraftInternshipDto } from './dto/create-draft-internship.dto';
import { UpdateDraftInternshipDto } from './dto/update-draft-internship.dto';
import { ApproveInternshipDto } from './dto/approve-internship.dto';
import { RejectInternshipDto } from './dto/reject-internship.dto';
import { RequestRevisionInternshipDto } from './dto/request-revision-internship.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller('internships')
@UseGuards(AuthGuard)
export class InternshipController {
  constructor(
    private readonly createDraftInternshipUseCase: CreateDraftInternshipUseCase,
    private readonly listInternshipsUseCase: ListInternshipsUseCase,
    private readonly getInternshipUseCase: GetInternshipUseCase,
    private readonly updateDraftInternshipUseCase: UpdateDraftInternshipUseCase,
    private readonly submitInternshipUseCase: SubmitInternshipUseCase,
    private readonly withdrawInternshipUseCase: WithdrawInternshipUseCase,
    private readonly approveInternshipUseCase: ApproveInternshipUseCase,
    private readonly rejectInternshipUseCase: RejectInternshipUseCase,
    private readonly requestRevisionInternshipUseCase: RequestRevisionInternshipUseCase,
    private readonly getInternshipHistoryUseCase: GetInternshipHistoryUseCase,
    private readonly completeInternshipUseCase: CompleteInternshipUseCase,
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
    const role = req.user!.role;
    const userId = req.user!.id;
    const departmentId =
      role === UserRole.STUDENT
        ? req.user!.departmentId
        : this.getDepartmentId(req);

    return this.listInternshipsUseCase.execute({ role, userId, departmentId });
  }

  @Post()
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDraftInternshipDto,
  ) {
    const departmentId = this.getDepartmentId(req);
    return this.createDraftInternshipUseCase.execute({
      studentId: req.user!.id,
      departmentId,
      companyId: dto.companyId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Get(':id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getInternshipUseCase.execute({
      internshipId: id,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
      currentUserDepartmentId: req.user!.departmentId,
    });
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDraftInternshipDto,
  ) {
    return this.updateDraftInternshipUseCase.execute({
      internshipId: id,
      currentUserId: req.user!.id,
      companyId: dto.companyId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async submit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.submitInternshipUseCase.execute({
      internshipId: id,
      currentUserId: req.user!.id,
    });
    return { message: 'Application submitted' };
  }

  @Post(':id/withdraw')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.withdrawInternshipUseCase.execute(id, req.user!.id);
    return { message: 'Application withdrawn' };
  }

  @Post(':id/approve')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApproveInternshipDto,
  ) {
    await this.approveInternshipUseCase.execute(id, req.user!.id);
    return { message: 'Application approved' };
  }

  @Post(':id/reject')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RejectInternshipDto,
  ) {
    await this.rejectInternshipUseCase.execute({
      internshipId: id,
      academicId: req.user!.id,
      reason: dto.reason,
    });
    return { message: 'Application rejected' };
  }

  @Post(':id/request-revision')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async requestRevision(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestRevisionInternshipDto,
  ) {
    await this.requestRevisionInternshipUseCase.execute({
      internshipId: id,
      academicId: req.user!.id,
      reason: dto.reason,
    });
    return { message: 'Revision requested' };
  }

  @Post(':id/complete')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async complete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.completeInternshipUseCase.execute(id, req.user!.id);
    return { success: true };
  }

  @Get(':id/history')
  async history(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.getInternshipHistoryUseCase.execute(id);
  }
}
