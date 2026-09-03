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

@Entity('final_grades')
export class FinalGradeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid', unique: true })
  internshipId: string;

  @OneToOne(() => InternshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: InternshipEntity;

  @Column({ name: 'employer_score', type: 'numeric', precision: 5, scale: 2 })
  employerScore: number;

  @Column({ name: 'academic_score', type: 'numeric', precision: 5, scale: 2 })
  academicScore: number;

  @Column({ name: 'final_score', type: 'numeric', precision: 5, scale: 2 })
  finalScore: number;

  @Column({ name: 'letter_grade', length: 2 })
  letterGrade: string;

  @Column({
    name: 'calculated_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  calculatedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
