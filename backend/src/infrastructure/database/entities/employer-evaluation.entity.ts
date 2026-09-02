import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';
import { UserEntity } from './user.entity';
import { EvaluationMethod } from '../../../domain/enums/evaluation-method.enum';

@Entity('employer_evaluations')
@Unique('uq_employer_evaluation_internship', ['internshipId'])
export class EmployerEvaluationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ type: 'enum', enum: EvaluationMethod })
  method: EvaluationMethod;

  @Column({ name: 'employer_name', length: 255 })
  employerName: string;

  @Column({ name: 'entered_by', type: 'uuid', nullable: true })
  enteredBy: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'entered_by' })
  academic: UserEntity | null;

  @Column({ name: 'grades', type: 'jsonb' })
  grades: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'scanned_sicil_fisi_path', length: 500, nullable: true })
  scannedSicilFisiPath: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'NOW()' })
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
