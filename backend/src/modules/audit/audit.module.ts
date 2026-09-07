import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../../infrastructure/database/entities/audit-log.entity';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { IAuditLogRepository } from '../../application/ports/audit-log.repository.port';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [{ provide: IAuditLogRepository, useClass: AuditLogRepository }],
  exports: [IAuditLogRepository],
})
export class AuditModule {}
