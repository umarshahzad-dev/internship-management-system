import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { ApplicationDocument } from '../../../domain/entities/application-document.entity';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { IConfigProvider } from '../../ports/config-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UploadApplicationDocumentInput {
  internshipId: string;
  documentTypeId: string;
  currentUserId: string;
  file: Express.Multer.File;
}

export interface UploadApplicationDocumentResult {
  id: string;
  internshipId: string;
  documentTypeId: string;
  status: ApplicationDocumentStatus;
  versionNumber: number;
  originalFilename: string;
  uploadedAt: string;
}

@Injectable()
export class UploadApplicationDocumentUseCase {
  constructor(
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly fileStorage: IFileStorage,
    private readonly dateProvider: IDateProvider,
    private readonly config: IConfigProvider,
  ) {}

  async execute(
    input: UploadApplicationDocumentInput,
  ): Promise<UploadApplicationDocumentResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.studentId !== input.currentUserId) {
      throw new DomainException(
        'FORBIDDEN',
        'Only owner can upload documents',
        403,
      );
    }

    if (
      internship.status !== InternshipStatus.DRAFT &&
      internship.status !== InternshipStatus.REVISION
    ) {
      throw new DomainException(
        'INVALID_STATE_TRANSITION',
        'Documents can only be uploaded in draft or revision state',
        409,
      );
    }

    const documentType = await this.documentTypeRepository.findById(
      input.documentTypeId,
    );
    if (!documentType) {
      throw new DomainException('NOT_FOUND', 'Document type not found', 404);
    }

    if (documentType.departmentId !== internship.departmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Document type does not belong to internship department',
        403,
      );
    }

    // Validate file extension
    const ext = path.extname(input.file.originalname).slice(1).toLowerCase();
    if (!documentType.allowedFileTypes.includes(ext)) {
      throw new DomainException(
        'FILE_TYPE_NOT_ALLOWED',
        `File type .${ext} is not allowed`,
        415,
      );
    }

    // Validate file size: min(global upload max, document type max)
    const globalMaxMb = await this.config.get<number>('upload_max_mb', 5);
    const effectiveMaxMb = Math.min(globalMaxMb, documentType.maxFileSize);
    const maxBytes = effectiveMaxMb * 1024 * 1024;
    if (input.file.size > maxBytes) {
      throw new DomainException(
        'UPLOAD_TOO_LARGE',
        `File size exceeds limit of ${effectiveMaxMb} MB`,
        413,
      );
    }

    const now = this.dateProvider.now();

    // Determine new version number
    const latest =
      await this.applicationDocumentRepository.findLatestByInternshipAndType(
        input.internshipId,
        input.documentTypeId,
      );
    const newVersion = latest ? latest.versionNumber + 1 : 1;

    // Save file
    const filename = `${randomUUID()}.${ext}`;
    const savedPath = await this.fileStorage.save(
      input.file.buffer,
      'application-documents',
      filename,
    );

    const document = new ApplicationDocument(
      randomUUID(),
      input.internshipId,
      input.documentTypeId,
      savedPath,
      input.file.originalname,
      ApplicationDocumentStatus.PENDING,
      null,
      newVersion,
      now,
      now,
    );

    const saved = await this.applicationDocumentRepository.create(document);

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      documentTypeId: saved.documentTypeId,
      status: saved.status,
      versionNumber: saved.versionNumber,
      originalFilename: saved.originalFilename,
      uploadedAt: saved.uploadedAt.toISOString(),
    };
  }
}
