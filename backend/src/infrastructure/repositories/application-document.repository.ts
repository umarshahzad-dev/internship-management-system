import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDocument } from '../../domain/entities/application-document.entity';
import { IApplicationDocumentRepository } from '../../application/ports/application-document.repository.port';
import { ApplicationDocumentEntity } from '../database/entities/application-document.entity';
import { ApplicationDocumentMapper } from '../mappers/application-document.mapper';
import { ApplicationDocumentStatus } from '../../domain/enums/application-document-status.enum';

@Injectable()
export class ApplicationDocumentRepository extends IApplicationDocumentRepository {
  constructor(
    @InjectRepository(ApplicationDocumentEntity)
    private readonly documentRepository: Repository<ApplicationDocumentEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<ApplicationDocument | null> {
    const entity = await this.documentRepository.findOne({ where: { id } });
    return entity ? ApplicationDocumentMapper.toDomain(entity) : null;
  }

  async findByInternship(internshipId: string): Promise<ApplicationDocument[]> {
    const entities = await this.documentRepository.find({
      where: { internshipId },
      order: { documentTypeId: 'ASC', versionNumber: 'DESC' },
    });
    return entities.map(ApplicationDocumentMapper.toDomain);
  }

  async findLatestByInternship(
    internshipId: string,
  ): Promise<ApplicationDocument[]> {
    const subQuery = this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.document_type_id', 'documentTypeId')
      .addSelect('MAX(doc.version_number)', 'maxVersion')
      .where('doc.internship_id = :internshipId', { internshipId })
      .groupBy('doc.document_type_id')
      .getQuery();

    const entities = await this.documentRepository
      .createQueryBuilder('ad')
      .innerJoin(
        `(${subQuery})`,
        'latest',
        'ad.document_type_id = latest."documentTypeId" AND ad.version_number = latest."maxVersion"',
      )
      .where('ad.internship_id = :internshipId', { internshipId })
      .orderBy('ad.document_type_id', 'ASC')
      .getMany();

    return entities.map(ApplicationDocumentMapper.toDomain);
  }

  async findLatestByInternshipAndType(
    internshipId: string,
    documentTypeId: string,
  ): Promise<ApplicationDocument | null> {
    const entity = await this.documentRepository.findOne({
      where: { internshipId, documentTypeId },
      order: { versionNumber: 'DESC' },
    });
    return entity ? ApplicationDocumentMapper.toDomain(entity) : null;
  }

  async findAcceptedByInternship(
    internshipId: string,
  ): Promise<ApplicationDocument[]> {
    const entities = await this.documentRepository.find({
      where: { internshipId, status: ApplicationDocumentStatus.ACCEPTED },
    });
    return entities.map(ApplicationDocumentMapper.toDomain);
  }

  async create(document: ApplicationDocument): Promise<ApplicationDocument> {
    const entity = ApplicationDocumentMapper.toPersistence(document);
    const saved = await this.documentRepository.save(entity);
    return ApplicationDocumentMapper.toDomain(saved);
  }

  async update(document: ApplicationDocument): Promise<ApplicationDocument> {
    const entity = ApplicationDocumentMapper.toPersistence(document);
    await this.documentRepository.update({ id: document.id }, entity);
    const updated = await this.documentRepository.findOne({
      where: { id: document.id },
    });
    return updated ? ApplicationDocumentMapper.toDomain(updated) : document;
  }
}
