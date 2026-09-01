import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { ListDepartmentsUseCase } from '../../application/use-cases/department/list-departments.use-case';
import { CreateDepartmentUseCase } from '../../application/use-cases/department/create-department.use-case';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UserRole } from '../../domain/value-objects/role.vo';

@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentController {
  constructor(
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async list() {
    return this.listDepartmentsUseCase.execute();
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
}
