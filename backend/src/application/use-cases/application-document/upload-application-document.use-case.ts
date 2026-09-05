import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { IApplicationDocumentRepository } from '../../ports/application-document.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { ApplicationDocument } from '../../../domain/entities/application-document.entity';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

export interface UploadApplicationDocumentInput {
  userId: string;
  internshipId: string;
  documentTypeId: string;
  file: Express.Multer.File;
}

export interface UploadApplicationDocumentResult {
  id: string;
  filePath: string;
  status: ApplicationDocumentStatus;
  versionNumber: number;
}

@Injectable()
export class UploadApplicationDocumentUseCase {
  constructor(
    private readonly applicationDocumentRepository: IApplicationDocumentRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly fileStorage: IFileStorage,
    private readonly dateProvider: IDateProvider,
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
    if (internship.studentId !== input.userId) {
      throw new DomainException(
        'FORBIDDEN',
        'You do not own this internship record',
        403,
      );
    }

    const documentType = await this.documentTypeRepository.findById(
      input.documentTypeId,
    );
    if (!documentType) {
      throw new DomainException('NOT_FOUND', 'Document type not found', 404);
    }
    if (documentType.source === DocumentSource.SYSTEM_GENERATED) {
      throw new DomainException(
        'FORBIDDEN',
        'System generated documents cannot be manually uploaded',
        403,
      );
    }

    const ext = path.extname(input.file.originalname).slice(1).toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      throw new DomainException(
        'FILE_TYPE_NOT_ALLOWED',
        'Only PDF, JPG, and PNG are allowed',
        415,
      );
    }

    const now = this.dateProvider.now();
    const filename = `${randomUUID()}.${ext}`;
    const savedPath = await this.fileStorage.save(
      input.file.buffer,
      'application-documents',
      filename,
    );

    const existing =
      await this.applicationDocumentRepository.findLatestByInternshipAndType(
        input.internshipId,
        input.documentTypeId,
      );

    if (existing) {
      const newVersion = existing.versionNumber + 1;
      const updatedDocument = new ApplicationDocument(
        existing.id,
        existing.internshipId,
        existing.documentTypeId,
        savedPath,
        input.file.originalname,
        ApplicationDocumentStatus.PENDING,
        null,
        newVersion,
        now,
        now,
      );
      const saved =
        await this.applicationDocumentRepository.update(updatedDocument);
      return {
        id: saved.id,
        filePath: saved.filePath,
        status: saved.status,
        versionNumber: saved.versionNumber,
      };
    } else {
      const newDocument = new ApplicationDocument(
        randomUUID(),
        input.internshipId,
        input.documentTypeId,
        savedPath,
        input.file.originalname,
        ApplicationDocumentStatus.PENDING,
        null,
        1,
        now,
        now,
      );
      const saved =
        await this.applicationDocumentRepository.create(newDocument);
      return {
        id: saved.id,
        filePath: saved.filePath,
        status: saved.status,
        versionNumber: saved.versionNumber,
      };
    }
  }
}
