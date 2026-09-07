import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigEntity } from '../../infrastructure/database/entities/system-config.entity';
import { SystemConfigRepository } from '../../infrastructure/repositories/system-config.repository';
import { ISystemConfigRepository } from '../../application/ports/system-config.repository.port';
import { ManageSystemConfigUseCase } from '../../application/use-cases/system-config/manage-system-config.use-case';
import { SystemConfigController } from './system-config.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../user/guards/roles.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfigEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [SystemConfigController],
  providers: [
    { provide: ISystemConfigRepository, useClass: SystemConfigRepository },
    ManageSystemConfigUseCase,
    RolesGuard,
  ],
  exports: [ISystemConfigRepository],
})
export class SystemConfigModule {}
