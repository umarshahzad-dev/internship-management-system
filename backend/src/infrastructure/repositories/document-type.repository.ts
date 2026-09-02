import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from '../../domain/entities/document-type.entity';
import { IDocumentTypeRepository } from '../../application/ports/document-type.repository.port';
import { DocumentTypeEntity } from '../database/entities/document-type.entity';
import { DocumentTypeMapper } from '../mappers/document-type.mapper';

@Injectable()
export class DocumentTypeRepository extends IDocumentTypeRepository {
  constructor(
    @InjectRepository(DocumentTypeEntity)
    private readonly documentTypeRepository: Repository<DocumentTypeEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<DocumentType | null> {
    const entity = await this.documentTypeRepository.findOne({ where: { id } });
    return entity ? DocumentTypeMapper.toDomain(entity) : null;
  }

  async findByDepartment(departmentId: string): Promise<DocumentType[]> {
    const entities = await this.documentTypeRepository.find({
      where: { departmentId },
      order: { name: 'ASC' },
    });
    return entities.map(DocumentTypeMapper.toDomain);
  }

  async create(documentType: DocumentType): Promise<DocumentType> {
    const entity = DocumentTypeMapper.toPersistence(documentType);
    const saved = await this.documentTypeRepository.save(entity);
    return DocumentTypeMapper.toDomain(saved);
  }

  async update(documentType: DocumentType): Promise<DocumentType> {
    const entity = DocumentTypeMapper.toPersistence(documentType);
    await this.documentTypeRepository.update({ id: documentType.id }, entity);
    const updated = await this.documentTypeRepository.findOne({
      where: { id: documentType.id },
    });
    return updated ? DocumentTypeMapper.toDomain(updated) : documentType;
  }

  async delete(id: string): Promise<void> {
    await this.documentTypeRepository.delete({ id });
  }
}
