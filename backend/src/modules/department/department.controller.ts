import { Body, Controller, Get, Patch, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { ListDepartmentsUseCase } from '../../application/use-cases/department/list-departments.use-case';
import { CreateDepartmentUseCase } from '../../application/use-cases/department/create-department.use-case';
import { UpdateDepartmentUseCase } from '../../application/use-cases/department/update-department.use-case';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UserRole } from '../../domain/value-objects/role.vo';

@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentController {
  constructor(
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async list(@Query('search') search?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('sortBy') sortBy?: string, @Query('sortDir') sortDir?: string) {
    return this.listDepartmentsUseCase.execute({ search, page, pageSize, sortBy, sortDir });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(CsrfGuard)
  async create(@Body() dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute({
      name: dto.name,
      facultyName: dto.facultyName,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(CsrfGuard)
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateDepartmentDto) {
    return this.updateDepartmentUseCase.execute(id, dto);
  }
}
