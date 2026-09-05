import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DocumentType } from '../../../domain/entities/document-type.entity';

@Injectable()
export class UploadTemplateUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly fileStorage: IFileStorage,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    documentTypeId: string,
    file: Express.Multer.File,
  ): Promise<{ templatePath: string }> {
    const existing = await this.documentTypeRepository.findById(documentTypeId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Document type not found', 404);
    }

    // Validate file extension against allowed types
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!existing.allowedFileTypes.includes(ext)) {
      throw new DomainException(
        'FILE_TYPE_NOT_ALLOWED',
        `File type .${ext} is not allowed`,
        415,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const savedPath = await this.fileStorage.save(
      file.buffer,
      'templates',
      filename,
    );

    const now = this.dateProvider.now();
    const updated = new DocumentType(
      existing.id,
      existing.departmentId,
      existing.name,
      existing.description,
      existing.isRequired,
      existing.source,
      existing.allowedFileTypes,
      existing.maxFileSize,
      savedPath,
      existing.createdAt,
      now,
    );

    await this.documentTypeRepository.update(updated);

    return { templatePath: savedPath };
  }
}
