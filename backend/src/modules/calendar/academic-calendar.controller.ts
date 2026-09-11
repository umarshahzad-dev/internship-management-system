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
  Query,
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
import { paginate } from '../../common/pagination/paginate';

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

  @Get()
  @Roles(UserRole.STUDENT, UserRole.ACADEMIC, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async list(@Req() req: AuthenticatedRequest, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('search') search?: string, @Query('year') year?: string, @Query('sortDir') sortDir?: string) {
    return paginate(await this.listCalendarsUseCase.execute({ search, year, sortDir }), page, pageSize);
  }

  @Get('next-term')
  @Roles(UserRole.STUDENT, UserRole.ACADEMIC, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async nextTerm(@Req() req: AuthenticatedRequest) {
    return this.getNextTermUseCase.execute();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateCalendarDto) {
    return this.createCalendarUseCase.execute({
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
