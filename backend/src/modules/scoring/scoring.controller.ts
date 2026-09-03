import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { EnterAcademicScoreUseCase } from '../../application/use-cases/scoring/enter-academic-score.use-case';
import { GetFinalGradeUseCase } from '../../application/use-cases/scoring/get-final-grade.use-case';
import { EnterAcademicScoreDto } from './dto/enter-academic-score.dto';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller()
@UseGuards(AuthGuard)
export class ScoringController {
  constructor(
    private readonly enterAcademicScoreUseCase: EnterAcademicScoreUseCase,
    private readonly getFinalGradeUseCase: GetFinalGradeUseCase,
  ) {}

  @Post('internships/:id/academic-score')
  @Roles(UserRole.ACADEMIC)
  @UseGuards(RolesGuard, CsrfGuard)
  async enterAcademicScore(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Body() dto: EnterAcademicScoreDto,
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
    return this.enterAcademicScoreUseCase.execute({
      internshipId,
      academicId: req.user!.id,
      academicDepartmentId: departmentId,
      logQuality: dto.logQuality,
      reportQuality: dto.reportQuality,
    });
  }

  @Get('internships/:id/grade')
  async getGrade(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getFinalGradeUseCase.execute({
      internshipId,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
      currentUserDepartmentId: req.user!.departmentId,
    });
  }
}
