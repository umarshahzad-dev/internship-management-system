import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InternshipModule } from '../internship/internship.module';
import { SgkController } from './sgk.controller';
import { SgkTrackingEntity } from '../../infrastructure/database/entities/sgk-tracking.entity';
import { SgkStatusHistoryEntity } from '../../infrastructure/database/entities/sgk-status-history.entity';
import { SgkTrackingRepository } from '../../infrastructure/repositories/sgk-tracking.repository';
import { SgkStatusHistoryRepository } from '../../infrastructure/repositories/sgk-status-history.repository';
import { ISgkTrackingRepository } from '../../application/ports/sgk-tracking.repository.port';
import { ISgkStatusHistoryRepository } from '../../application/ports/sgk-status-history.repository.port';
import { IFileStorage } from '../../application/ports/file-storage.port';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { CreateSgkRecordUseCase } from '../../application/use-cases/sgk/create-sgk-record.use-case';
import { ListSgkRecordsUseCase } from '../../application/use-cases/sgk/list-sgk-records.use-case';
import { UploadSgkDocumentUseCase } from '../../application/use-cases/sgk/upload-sgk-document.use-case';
import { UpdateSgkStatusUseCase } from '../../application/use-cases/sgk/update-sgk-status.use-case';
import { GetSgkHistoryUseCase } from '../../application/use-cases/sgk/get-sgk-history.use-case';
import { TransitionToOngoingUseCase } from '../../application/use-cases/sgk/transition-to-ongoing.use-case';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    InternshipModule,
    TypeOrmModule.forFeature([SgkTrackingEntity, SgkStatusHistoryEntity]),
  ],
  controllers: [SgkController],
  providers: [
    { provide: ISgkTrackingRepository, useClass: SgkTrackingRepository },
    {
      provide: ISgkStatusHistoryRepository,
      useClass: SgkStatusHistoryRepository,
    },
    { provide: IFileStorage, useClass: LocalFileStorageService },
    { provide: IDateProvider, useClass: SystemDateProvider },
    CreateSgkRecordUseCase,
    ListSgkRecordsUseCase,
    UploadSgkDocumentUseCase,
    UpdateSgkStatusUseCase,
    GetSgkHistoryUseCase,
    TransitionToOngoingUseCase,
    RolesGuard,
  ],
  exports: [ISgkTrackingRepository, ISgkStatusHistoryRepository],
})
export class SgkModule {}
