import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';
import { UserEntity } from './user.entity';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

@Entity('internship_status_history')
export class InternshipStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ name: 'from_status', type: 'enum', enum: InternshipStatus })
  fromStatus: InternshipStatus;

  @Column({ name: 'to_status', type: 'enum', enum: InternshipStatus })
  toStatus: InternshipStatus;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  user: UserEntity | null;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' })
  changedAt: Date;
}
