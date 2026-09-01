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
import { ListHolidaysUseCase } from '../../application/use-cases/holiday/list-holidays.use-case';
import { CreateHolidayUseCase } from '../../application/use-cases/holiday/create-holiday.use-case';
import { UpdateHolidayUseCase } from '../../application/use-cases/holiday/update-holiday.use-case';
import { DeleteHolidayUseCase } from '../../application/use-cases/holiday/delete-holiday.use-case';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller('holidays')
@UseGuards(AuthGuard)
export class HolidayController {
  constructor(
    private readonly listHolidaysUseCase: ListHolidaysUseCase,
    private readonly createHolidayUseCase: CreateHolidayUseCase,
    private readonly updateHolidayUseCase: UpdateHolidayUseCase,
    private readonly deleteHolidayUseCase: DeleteHolidayUseCase,
  ) {}

  private getDepartmentId(req: AuthenticatedRequest): string | undefined {
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
    return req.user?.departmentId ?? undefined;
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    return this.listHolidaysUseCase.execute(departmentId);
  }

  @Get('merged')
  async merged(@Req() req: AuthenticatedRequest) {
    const departmentId = this.getDepartmentId(req);
    const holidays = await this.listHolidaysUseCase.execute(departmentId);
    return { holidays };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateHolidayDto) {
    return this.createHolidayUseCase.execute({
      departmentId: dto.departmentId ?? null,
      holidayDate: new Date(dto.holidayDate),
      name: dto.name,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.updateHolidayUseCase.execute({
      holidayId: id,
      departmentId: dto.departmentId,
      holidayDate: dto.holidayDate ? new Date(dto.holidayDate) : undefined,
      name: dto.name,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteHolidayUseCase.execute(id);
    return { message: 'Holiday deleted' };
  }
}
