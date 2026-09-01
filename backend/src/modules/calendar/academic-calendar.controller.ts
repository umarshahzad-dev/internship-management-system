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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { ListCalendarsUseCase } from '../../application/use-cases/calendar/list-calendars.use-case';
import { CreateCalendarUseCase } from '../../application/use-cases/calendar/create-calendar.use-case';
import { UpdateCalendarUseCase } from '../../application/use-cases/calendar/update-calendar.use-case';
import { DeleteCalendarUseCase } from '../../application/use-cases/calendar/delete-calendar.use-case';
import { GetNextTermUseCase } from '../../application/use-cases/calendar/get-next-term.use-case';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller('calendars')
@UseGuards(AuthGuard)
export class AcademicCalendarController {
  constructor(
    private readonly listCalendarsUseCase: ListCalendarsUseCase,
    private readonly createCalendarUseCase: CreateCalendarUseCase,
    private readonly updateCalendarUseCase: UpdateCalendarUseCase,
    private readonly deleteCalendarUseCase: DeleteCalendarUseCase,
    private readonly getNextTermUseCase: GetNextTermUseCase,
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
    return this.listCalendarsUseCase.execute(departmentId);
  }

  @Get('next-term')
  async nextTerm(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    return this.getNextTermUseCase.execute(departmentId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateCalendarDto) {
    return this.createCalendarUseCase.execute({
      departmentId: dto.departmentId,
      termName: dto.termName,
      applicationStart: new Date(dto.applicationStart),
      applicationEnd: new Date(dto.applicationEnd),
      internshipStart: new Date(dto.internshipStart),
      internshipEnd: new Date(dto.internshipEnd),
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.updateCalendarUseCase.execute({
      calendarId: id,
      termName: dto.termName,
      applicationStart: dto.applicationStart
        ? new Date(dto.applicationStart)
        : undefined,
      applicationEnd: dto.applicationEnd
        ? new Date(dto.applicationEnd)
        : undefined,
      internshipStart: dto.internshipStart
        ? new Date(dto.internshipStart)
        : undefined,
      internshipEnd: dto.internshipEnd
        ? new Date(dto.internshipEnd)
        : undefined,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteCalendarUseCase.execute(id);
    return { message: 'Calendar deleted' };
  }
}
