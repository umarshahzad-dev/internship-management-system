import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { SgkTracking } from '../../../domain/entities/sgk-tracking.entity';
import { SgkStatusHistory } from '../../../domain/entities/sgk-status-history.entity';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { ISgkStatusHistoryRepository } from '../../ports/sgk-status-history.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UploadSgkDocumentInput {
  sgkTrackingId: string;
  academicId: string;
  academicDepartmentId: string;
  file: Express.Multer.File;
}

export interface UploadSgkDocumentResult {
  id: string;
  internshipId: string;
  status: SgkStatus;
  documentPath: string;
}

@Injectable()
export class UploadSgkDocumentUseCase {
  constructor(
    private readonly sgkTrackingRepository: ISgkTrackingRepository,
    private readonly historyRepository: ISgkStatusHistoryRepository,
    private readonly internshipRepository: IInternshipRepository,
    private readonly fileStorage: IFileStorage,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    input: UploadSgkDocumentInput,
  ): Promise<UploadSgkDocumentResult> {
    const tracking = await this.sgkTrackingRepository.findById(
      input.sgkTrackingId,
    );
    if (!tracking) {
      throw new DomainException('NOT_FOUND', 'SGK tracking not found', 404);
    }

    const internship = await this.internshipRepository.findById(
      tracking.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (internship.departmentId !== input.academicDepartmentId) {
      throw new DomainException(
        'FORBIDDEN',
        'Academic cannot manage SGK for other departments',
        403,
      );
    }

    // Save file
    const ext = path.extname(input.file.originalname).slice(1).toLowerCase();
    if (!['pdf', 'jpg', 'png'].includes(ext)) {
      throw new DomainException(
        'FILE_TYPE_NOT_ALLOWED',
        `File type .${ext} is not allowed`,
        415,
      );
    }

    const now = this.dateProvider.now();
    const filename = `${randomUUID()}.${ext}`;
    const savedPath = await this.fileStorage.save(
      input.file.buffer,
      'sgk-documents',
      filename,
    );

    const updatedTracking = new SgkTracking(
      tracking.id,
      tracking.internshipId,
      SgkStatus.SUBMITTED,
      savedPath,
      tracking.createdAt,
      now,
    );
    const saved = await this.sgkTrackingRepository.update(updatedTracking);

    const history = new SgkStatusHistory(
      randomUUID(),
      tracking.id,
      tracking.status,
      SgkStatus.SUBMITTED,
      input.academicId,
      now,
    );
    await this.historyRepository.create(history);

    return {
      id: saved.id,
      internshipId: saved.internshipId,
      status: saved.status,
      documentPath: saved.documentPath!,
    };
  }
}
