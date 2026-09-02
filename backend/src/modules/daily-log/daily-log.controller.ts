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
import { CreateDailyLogUseCase } from '../../application/use-cases/daily-log/create-daily-log.use-case';
import { ListDailyLogsUseCase } from '../../application/use-cases/daily-log/list-daily-logs.use-case';
import { UpdateDailyLogUseCase } from '../../application/use-cases/daily-log/update-daily-log.use-case';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';
import { UserRole } from '../../domain/value-objects/role.vo';

@Controller()
@UseGuards(AuthGuard)
export class DailyLogController {
  constructor(
    private readonly createDailyLogUseCase: CreateDailyLogUseCase,
    private readonly listDailyLogsUseCase: ListDailyLogsUseCase,
    private readonly updateDailyLogUseCase: UpdateDailyLogUseCase,
  ) {}

  @Post('internships/:id/daily-logs')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Body() dto: CreateDailyLogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.createDailyLogUseCase.execute({
      internshipId,
      logDate: new Date(dto.logDate),
      content: dto.content,
      currentUserId: req.user!.id,
    });
  }

  @Get('internships/:id/daily-logs')
  async list(
    @Param('id', new ParseUUIDPipe()) internshipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listDailyLogsUseCase.execute({
      internshipId,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
      currentUserDepartmentId: req.user!.departmentId,
    });
  }

  @Patch('daily-logs/:id')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) logId: string,
    @Body() dto: UpdateDailyLogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.updateDailyLogUseCase.execute({
      logId,
      logDate: dto.logDate ? new Date(dto.logDate) : undefined,
      content: dto.content,
      currentUserId: req.user!.id,
    });
  }
}
