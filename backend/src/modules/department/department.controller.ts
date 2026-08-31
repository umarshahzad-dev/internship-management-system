import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ListDepartmentsUseCase } from '../../application/use-cases/department/list-departments.use-case';
import { CreateDepartmentUseCase } from '../../application/use-cases/department/create-department.use-case';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
@UseGuards(AuthGuard)
export class DepartmentController {
  constructor(
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
  ) {}

  @Get()
  async list() {
    return this.listDepartmentsUseCase.execute();
  }

  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute({
      name: dto.name,
      facultyName: dto.facultyName,
    });
  }
}
