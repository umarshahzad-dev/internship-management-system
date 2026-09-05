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
import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

@Entity('internships')
export class InternshipEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => DepartmentEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({
    type: 'enum',
    enum: InternshipStatus,
    default: InternshipStatus.DRAFT,
  })
  status: InternshipStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'grading_data', type: 'jsonb', default: {} })
  gradingData: Record<string, any>;

  @Column({ default: false })
  locked: boolean;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'employer_approval_ip', length: 45, nullable: true })
  employerApprovalIp: string | null;

  @Column({
    name: 'employer_approval_timestamp',
    type: 'timestamptz',
    nullable: true,
  })
  employerApprovalTimestamp: Date | null;

  @Column({
    name: 'commission_approval_user_id',
    type: 'uuid',
    nullable: true,
  })
  commissionApprovalUserId: string | null;

  @Column({
    name: 'commission_approval_timestamp',
    type: 'timestamptz',
    nullable: true,
  })
  commissionApprovalTimestamp: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
