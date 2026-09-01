import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'tax_number', length: 10, unique: true })
  taxNumber: string;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ length: 100, nullable: true })
  industry: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ length: 255, nullable: true })
  website: string | null;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contact_phone', length: 30, nullable: true })
  contactPhone: string | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
