import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { InternshipEntity } from './internship.entity';

@Entity('employer_tokens')
export class EmployerTokenEntity {
  @PrimaryColumn({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
