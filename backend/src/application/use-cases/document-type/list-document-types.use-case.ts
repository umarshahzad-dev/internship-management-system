import { Injectable } from '@nestjs/common';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

export interface DocumentTypeListItem {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  source: DocumentSource;
  allowedFileTypes: string[];
  maxFileSize: number;
  templatePath: string | null;
}

@Injectable()
export class ListDocumentTypesUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  async execute(departmentId: string): Promise<DocumentTypeListItem[]> {
    const documentTypes =
      await this.documentTypeRepository.findByDepartment(departmentId);
    return documentTypes.map((dt) => ({
      id: dt.id,
      departmentId: dt.departmentId,
      name: dt.name,
      description: dt.description,
      isRequired: dt.isRequired,
      source: dt.source,
      allowedFileTypes: dt.allowedFileTypes,
      maxFileSize: dt.maxFileSize,
      templatePath: dt.templatePath,
    }));
  }
}
