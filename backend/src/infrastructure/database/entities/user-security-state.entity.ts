import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_security_state')
export class UserSecurityStateEntity {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.securityState, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({
    name: 'password_changed_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  passwordChangedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
