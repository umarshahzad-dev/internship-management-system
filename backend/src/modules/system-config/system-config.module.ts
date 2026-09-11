import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigEntity } from '../../infrastructure/database/entities/system-config.entity';
import { DepartmentConfigEntity } from '../../infrastructure/database/entities/department-config.entity';
import { SystemConfigRepository } from '../../infrastructure/repositories/system-config.repository';
import { ISystemConfigRepository } from '../../application/ports/system-config.repository.port';
import { ManageSystemConfigUseCase } from '../../application/use-cases/system-config/manage-system-config.use-case';
import { SystemConfigController } from './system-config.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../user/guards/roles.guard';
import { IDepartmentConfigRepository } from '../../application/ports/department-config.repository.port';
import { DepartmentConfigRepository } from '../../infrastructure/repositories/department-config.repository';
import { ResolveConfigValueUseCase } from '../../application/use-cases/system-config/resolve-config-value.use-case';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfigEntity, DepartmentConfigEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [SystemConfigController],
  providers: [
    { provide: ISystemConfigRepository, useClass: SystemConfigRepository },
    ManageSystemConfigUseCase,
    ResolveConfigValueUseCase,
    { provide: IDepartmentConfigRepository, useClass: DepartmentConfigRepository },
    RolesGuard,
  ],
  exports: [ISystemConfigRepository],
})
export class SystemConfigModule {}
