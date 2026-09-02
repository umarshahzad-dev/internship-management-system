import { Injectable } from '@nestjs/common';
import { IDocumentTypeRepository } from '../../ports/document-type.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  async execute(documentTypeId: string): Promise<void> {
    const existing = await this.documentTypeRepository.findById(documentTypeId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Document type not found', 404);
    }
    await this.documentTypeRepository.delete(documentTypeId);
  }
}
