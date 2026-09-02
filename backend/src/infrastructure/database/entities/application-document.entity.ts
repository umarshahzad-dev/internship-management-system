import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';
import { DocumentTypeEntity } from './document-type.entity';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';

@Entity('application_documents')
export class ApplicationDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @ManyToOne(() => DocumentTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentTypeEntity;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename: string;

  @Column({
    type: 'enum',
    enum: ApplicationDocumentStatus,
    default: ApplicationDocumentStatus.PENDING,
  })
  status: ApplicationDocumentStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'version_number', type: 'int', default: 1 })
  versionNumber: number;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
