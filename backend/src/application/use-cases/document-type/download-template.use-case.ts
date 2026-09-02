import { Injectable } from '@nestjs/common';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DownloadTemplateUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async execute(documentTypeId: string): Promise<Buffer> {
    const docType = await this.documentTypeRepository.findById(documentTypeId);
    if (!docType || !docType.templatePath) {
      throw new DomainException('NOT_FOUND', 'Template not found', 404);
    }
    return this.fileStorage.get(docType.templatePath);
  }
}
