import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DocumentTypeController } from './document-type.controller';
import { ListDocumentTypesUseCase } from '../../application/use-cases/document-type/list-document-types.use-case';
import { CreateDocumentTypeUseCase } from '../../application/use-cases/document-type/create-document-type.use-case';
import { UpdateDocumentTypeUseCase } from '../../application/use-cases/document-type/update-document-type.use-case';
import { DeleteDocumentTypeUseCase } from '../../application/use-cases/document-type/delete-document-type.use-case';
import { UploadTemplateUseCase } from '../../application/use-cases/document-type/upload-template.use-case';
import { DownloadTemplateUseCase } from '../../application/use-cases/document-type/download-template.use-case';
import { DocumentTypeRepository } from '../../infrastructure/repositories/document-type.repository';
import { DocumentTypeEntity } from '../../infrastructure/database/entities/document-type.entity';
import { IDocumentTypeRepository } from '../../application/ports/document-type.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';
import { IFileStorage } from '../../application/ports/file-storage.port';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([DocumentTypeEntity])],
  controllers: [DocumentTypeController],
  providers: [
    { provide: IDocumentTypeRepository, useClass: DocumentTypeRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    { provide: IFileStorage, useClass: LocalFileStorageService },
    ListDocumentTypesUseCase,
    CreateDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    DeleteDocumentTypeUseCase,
    UploadTemplateUseCase,
    DownloadTemplateUseCase,
    RolesGuard,
  ],
  exports: [IDocumentTypeRepository],
})
export class DocumentTypeModule {}
