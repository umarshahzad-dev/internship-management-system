import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { DepartmentEntity } from '../infrastructure/database/entities/department.entity';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserSecurityStateEntity } from '../infrastructure/database/entities/user-security-state.entity';
import { DocumentTypeEntity } from '../infrastructure/database/entities/document-type.entity';
import { SystemConfigEntity } from '../infrastructure/database/entities/system-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DepartmentEntity,
      UserEntity,
      UserSecurityStateEntity,
      DocumentTypeEntity,
      SystemConfigEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
