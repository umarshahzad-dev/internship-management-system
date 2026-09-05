import { Injectable } from '@nestjs/common';
import { DocumentType } from '../../../domain/entities/document-type.entity';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

export interface UpdateDocumentTypeInput {
  documentTypeId: string;
  name?: string;
  description?: string | null;
  isRequired?: boolean;
  source?: DocumentSource;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface UpdateDocumentTypeResult {
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
export class UpdateDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: UpdateDocumentTypeInput,
  ): Promise<UpdateDocumentTypeResult> {
    const existing = await this.documentTypeRepository.findById(
      input.documentTypeId,
    );
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Document type not found', 404);
    }

    const now = this.dateProvider.now();
    const updated = new DocumentType(
      existing.id,
      existing.departmentId,
      input.name ?? existing.name,
      input.description !== undefined
        ? input.description
        : existing.description,
      input.isRequired ?? existing.isRequired,
      input.source !== undefined ? input.source : existing.source,
      input.allowedFileTypes ?? existing.allowedFileTypes,
      input.maxFileSize ?? existing.maxFileSize,
      existing.templatePath,
      existing.createdAt,
      now,
    );

    const saved = await this.documentTypeRepository.update(updated);
    return {
      id: saved.id,
      departmentId: saved.departmentId,
      name: saved.name,
      description: saved.description,
      isRequired: saved.isRequired,
      source: saved.source,
      allowedFileTypes: saved.allowedFileTypes,
      maxFileSize: saved.maxFileSize,
      templatePath: saved.templatePath,
    };
  }
}
