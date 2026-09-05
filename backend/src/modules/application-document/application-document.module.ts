import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DocumentTypeModule } from '../document-type/document-type.module';
import { InternshipModule } from '../internship/internship.module';
import { ApplicationDocumentController } from './application-document.controller';
import { UploadApplicationDocumentUseCase } from '../../application/use-cases/application-document/upload-application-document.use-case';
import { ListApplicationDocumentsUseCase } from '../../application/use-cases/application-document/list-application-documents.use-case';
import { AcceptApplicationDocumentUseCase } from '../../application/use-cases/application-document/accept-application-document.use-case';
import { RejectApplicationDocumentUseCase } from '../../application/use-cases/application-document/reject-application-document.use-case';
import { ApplicationDocumentRepository } from '../../infrastructure/repositories/application-document.repository';
import { InternshipRepository } from '../../infrastructure/repositories/internship.repository';
import { DocumentTypeRepository } from '../../infrastructure/repositories/document-type.repository';
import { ApplicationDocumentEntity } from '../../infrastructure/database/entities/application-document.entity';
import { InternshipEntity } from '../../infrastructure/database/entities/internship.entity';
import { DocumentTypeEntity } from '../../infrastructure/database/entities/document-type.entity';
import { IApplicationDocumentRepository } from '../../application/ports/application-document.repository.port';
import { IInternshipRepository } from '../../application/ports/internship.repository.port';
import { IDocumentTypeRepository } from '../../application/ports/document-type.repository.port';
import { IFileStorage } from '../../application/ports/file-storage.port';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { IConfigProvider } from '../../application/ports/config-provider.port';
import { EnvConfigProvider } from '../../infrastructure/services/env-config-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    DocumentTypeModule,
    InternshipModule,
    TypeOrmModule.forFeature([
      ApplicationDocumentEntity,
      InternshipEntity,
      DocumentTypeEntity,
    ]),
  ],
  controllers: [ApplicationDocumentController],
  providers: [
    {
      provide: IApplicationDocumentRepository,
      useClass: ApplicationDocumentRepository,
    },
    { provide: IInternshipRepository, useClass: InternshipRepository },
    { provide: IDocumentTypeRepository, useClass: DocumentTypeRepository },
    { provide: IFileStorage, useClass: LocalFileStorageService },
    { provide: IDateProvider, useClass: SystemDateProvider },
    { provide: IConfigProvider, useClass: EnvConfigProvider },
    UploadApplicationDocumentUseCase,
    ListApplicationDocumentsUseCase,
    AcceptApplicationDocumentUseCase,
    RejectApplicationDocumentUseCase,
    RolesGuard,
  ],
  exports: [IApplicationDocumentRepository],
})
export class ApplicationDocumentModule {}
