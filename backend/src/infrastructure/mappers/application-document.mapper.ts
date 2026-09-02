import { ApplicationDocument } from '../../domain/entities/application-document.entity';
import { ApplicationDocumentEntity } from '../database/entities/application-document.entity';

export class ApplicationDocumentMapper {
  static toDomain(entity: ApplicationDocumentEntity): ApplicationDocument {
    return new ApplicationDocument(
      entity.id,
      entity.internshipId,
      entity.documentTypeId,
      entity.filePath,
      entity.originalFilename,
      entity.status,
      entity.rejectionReason,
      entity.versionNumber,
      entity.uploadedAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: ApplicationDocument): ApplicationDocumentEntity {
    const entity = new ApplicationDocumentEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.documentTypeId = domain.documentTypeId;
    entity.filePath = domain.filePath;
    entity.originalFilename = domain.originalFilename;
    entity.status = domain.status;
    entity.rejectionReason = domain.rejectionReason;
    entity.versionNumber = domain.versionNumber;
    entity.uploadedAt = domain.uploadedAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
