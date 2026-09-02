import { DocumentType } from '../../domain/entities/document-type.entity';

export abstract class IDocumentTypeRepository {
  abstract findById(id: string): Promise<DocumentType | null>;
  abstract findByDepartment(departmentId: string): Promise<DocumentType[]>;
  abstract create(documentType: DocumentType): Promise<DocumentType>;
  abstract update(documentType: DocumentType): Promise<DocumentType>;
  abstract delete(id: string): Promise<void>;
}
