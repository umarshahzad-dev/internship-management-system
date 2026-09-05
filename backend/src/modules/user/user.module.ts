import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { RolesGuard } from './guards/roles.guard';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { ImportUsersUseCase } from '../../application/use-cases/user/import-users.use-case';
import { UploadProfilePhotoUseCase } from '../../application/use-cases/user/upload-profile-photo.use-case';
import { DepartmentEntity } from '../../infrastructure/database/entities/department.entity';
import { IDepartmentRepository } from '../../application/ports/department.repository.port';
import { DepartmentRepository } from '../../infrastructure/repositories/department.repository';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { IFileStorage } from '../../application/ports/file-storage.port';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([DepartmentEntity])],
  controllers: [UserController],
  providers: [
    RolesGuard,
    ListUsersUseCase,
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    ImportUsersUseCase,
    UploadProfilePhotoUseCase,
    { provide: IDepartmentRepository, useClass: DepartmentRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    { provide: IFileStorage, useClass: LocalFileStorageService },
  ],
})
export class UserModule {}
