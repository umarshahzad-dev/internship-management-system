import {
  Column,
  CreateDateColumn,
  Index,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';

@Entity('daily_logs')
@Index('idx_daily_logs_internship_id', ['internshipId'])
@Unique('uq_daily_log_internship_date', ['internshipId', 'logDate'])
export class DailyLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
