import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentController } from './department.controller';
import { ListDepartmentsUseCase } from '../../application/use-cases/department/list-departments.use-case';
import { CreateDepartmentUseCase } from '../../application/use-cases/department/create-department.use-case';
import { DepartmentRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentEntity } from '../../infrastructure/database/entities/department.entity';
import { IDepartmentRepository } from '../../application/ports/department.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity]), AuthModule],
  controllers: [DepartmentController],
  providers: [
    { provide: IDepartmentRepository, useClass: DepartmentRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    ListDepartmentsUseCase,
    CreateDepartmentUseCase,
  ],
  exports: [IDepartmentRepository],
})
export class DepartmentModule {}
