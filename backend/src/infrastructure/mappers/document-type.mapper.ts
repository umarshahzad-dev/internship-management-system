import { DocumentType } from '../../domain/entities/document-type.entity';
import { DocumentTypeEntity } from '../database/entities/document-type.entity';
import { DocumentSource } from '../../domain/enums/document-source.enum';

export class DocumentTypeMapper {
  static toDomain(entity: DocumentTypeEntity): DocumentType {
    return new DocumentType(
      entity.id,
      entity.departmentId,
      entity.name,
      entity.description,
      entity.isRequired,
      entity.source || DocumentSource.EXTERNAL_UPLOAD,
      entity.allowedFileTypes,
      entity.maxFileSize,
      entity.templatePath,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: DocumentType): DocumentTypeEntity {
    const entity = new DocumentTypeEntity();
    entity.id = domain.id;
    entity.departmentId = domain.departmentId;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.isRequired = domain.isRequired;
    entity.source = domain.source;
    entity.allowedFileTypes = domain.allowedFileTypes;
    entity.maxFileSize = domain.maxFileSize;
    entity.templatePath = domain.templatePath;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
