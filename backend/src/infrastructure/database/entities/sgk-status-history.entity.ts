import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SgkTrackingEntity } from './sgk-tracking.entity';
import { UserEntity } from './user.entity';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

@Entity('sgk_status_history')
export class SgkStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sgk_tracking_id', type: 'uuid' })
  sgkTrackingId: string;

  @ManyToOne(() => SgkTrackingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sgk_tracking_id' })
  sgkTracking: SgkTrackingEntity;

  @Column({ name: 'from_status', type: 'enum', enum: SgkStatus })
  fromStatus: SgkStatus;

  @Column({ name: 'to_status', type: 'enum', enum: SgkStatus })
  toStatus: SgkStatus;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  user: UserEntity | null;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' })
  changedAt: Date;
}
