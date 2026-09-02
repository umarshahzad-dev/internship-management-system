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
import { UserRole } from '../../domain/value-objects/role.vo';
import { GenerateEvaluationLinkUseCase } from '../../application/use-cases/employer-evaluation/generate-evaluation-link.use-case';
import { CreateManualEvaluationUseCase } from '../../application/use-cases/employer-evaluation/create-manual-evaluation.use-case';
import { GetEmployerEvaluationUseCase } from '../../application/use-cases/employer-evaluation/get-employer-evaluation.use-case';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller()
@UseGuards(AuthGuard)
export class EmployerEvaluationController {
  constructor(
    private readonly generateEvaluationLinkUseCase: GenerateEvaluationLinkUseCase,
    private readonly createManualEvaluationUseCase: CreateManualEvaluationUseCase,
    private readonly getEmployerEvaluationUseCase: GetEmployerEvaluationUseCase,
  ) {}

  @Post('internships/:id/employer-evaluation/generate-link')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async generateLink(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
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
    return this.generateEvaluationLinkUseCase.execute({
      internshipId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
    });
  }

  @Post('internships/:id/employer-evaluation/manual')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('scannedSicilFisi'))
  async createManual(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Body('employerName') employerName: string,
    @Body('grades') gradesJson: string,
    @Body('comments') comments: string | null,
    @UploadedFile() scannedSicilFisi: Express.Multer.File | undefined,
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

    let grades: Record<string, string>;
    try {
      grades = JSON.parse(gradesJson);
    } catch {
      throw new DomainException(
        'VALIDATION_ERROR',
        'grades must be valid JSON',
        400,
      );
    }

    return this.createManualEvaluationUseCase.execute({
      internshipId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
      employerName,
      grades,
      comments: comments ?? null,
      scannedSicilFisi: scannedSicilFisi ?? null,
    });
  }

  @Get('internships/:id/employer-evaluation')
  async getEvaluation(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getEmployerEvaluationUseCase.execute({
      internshipId,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
      currentUserDepartmentId: req.user!.departmentId,
    });
  }
}
