import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../../domain/value-objects/role.vo';

@Entity('announcements')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'target_roles', type: 'enum', enum: UserRole, array: true }) targetRoles: UserRole[];
  @Column({ name: 'department_id', type: 'uuid', nullable: true }) departmentId: string | null;
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true }) expiresAt: Date | null;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
