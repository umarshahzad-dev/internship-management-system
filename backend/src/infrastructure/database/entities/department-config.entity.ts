import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { DepartmentEntity } from './department.entity'

@Entity('department_configs')
@Unique(['departmentId', 'key'])
export class DepartmentConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ name: 'department_id', type: 'uuid' }) departmentId: string
  @ManyToOne(() => DepartmentEntity, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'department_id' }) department: DepartmentEntity
  @Column({ length: 100 }) key: string
  @Column({ type: 'text' }) value: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date
}
