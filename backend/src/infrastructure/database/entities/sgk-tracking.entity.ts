import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

@Entity('sgk_tracking')
export class SgkTrackingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid', unique: true })
  internshipId: string;

  @OneToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ type: 'enum', enum: SgkStatus, default: SgkStatus.PENDING })
  status: SgkStatus;

  @Column({ name: 'document_path', length: 500, nullable: true })
  documentPath: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
