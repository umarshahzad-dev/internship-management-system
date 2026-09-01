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

@Entity('academic_calendars')
export class AcademicCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => DepartmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column({ name: 'term_name', length: 100 })
  termName: string;

  @Column({ name: 'application_start', type: 'date' })
  applicationStart: Date;

  @Column({ name: 'application_end', type: 'date' })
  applicationEnd: Date;

  @Column({ name: 'internship_start', type: 'date' })
  internshipStart: Date;

  @Column({ name: 'internship_end', type: 'date' })
  internshipEnd: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
