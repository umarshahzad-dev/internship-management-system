import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepartmentEntity } from './department.entity';

@Entity('document_types')
export class DocumentTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => DepartmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({
    name: 'allowed_file_types',
    type: 'text',
    array: true,
    default: ['pdf', 'jpg', 'png'],
  })
  allowedFileTypes: string[];

  @Column({ name: 'max_file_size', type: 'int', default: 5 })
  maxFileSize: number;

  @Column({ name: 'template_path', length: 500, nullable: true })
  templatePath: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
