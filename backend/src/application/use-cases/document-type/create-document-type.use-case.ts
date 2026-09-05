import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DocumentType } from '../../../domain/entities/document-type.entity';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

export interface CreateDocumentTypeInput {
  departmentId: string;
  name: string;
  description?: string | null;
  isRequired?: boolean;
  source: DocumentSource;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface CreateDocumentTypeResult {
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
export class CreateDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: CreateDocumentTypeInput,
  ): Promise<CreateDocumentTypeResult> {
    const now = this.dateProvider.now();
    const documentType = new DocumentType(
      randomUUID(),
      input.departmentId,
      input.name,
      input.description ?? null,
      input.isRequired ?? false,
      input.source,
      input.allowedFileTypes ?? ['pdf', 'jpg', 'png'],
      input.maxFileSize ?? 5,
      null,
      now,
      now,
    );

    const saved = await this.documentTypeRepository.create(documentType);
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
