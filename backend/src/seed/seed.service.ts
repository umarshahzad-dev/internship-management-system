import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { DepartmentEntity } from '../infrastructure/database/entities/department.entity';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserSecurityStateEntity } from '../infrastructure/database/entities/user-security-state.entity';
import { DocumentTypeEntity } from '../infrastructure/database/entities/document-type.entity';
import { UserRole } from '../domain/value-objects/role.vo';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSecurityStateEntity)
    private readonly securityStateRepository: Repository<UserSecurityStateEntity>,
    @InjectRepository(DocumentTypeEntity)
    private readonly documentTypeRepository: Repository<DocumentTypeEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED !== 'true') {
      return;
    }
    this.logger.log('Seeding database...');

    // Create department
    let department = await this.departmentRepository.findOne({
      where: { name: 'Computer Engineering' },
    });
    if (!department) {
      department = this.departmentRepository.create({
        name: 'Computer Engineering',
        facultyName: 'Engineering',
      });
      department = await this.departmentRepository.save(department);
    }

    // Create users (same as before)
    await this.createUserIfNotExists({
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      departmentId: null,
      studentNumber: null,
    });
    await this.createUserIfNotExists({
      email: 'academic@example.com',
      role: UserRole.ACADEMIC,
      firstName: 'Academic',
      lastName: 'User',
      departmentId: department.id,
      studentNumber: null,
    });
    await this.createUserIfNotExists({
      email: 'student@example.com',
      role: UserRole.STUDENT,
      firstName: 'Student',
      lastName: 'User',
      departmentId: department.id,
      studentNumber: '20260001',
    });

    // Seed document types for department
    await this.seedDocumentTypes(department.id);

    this.logger.log('Seeding completed.');
  }

  private async seedDocumentTypes(departmentId: string): Promise<void> {
    const definitions = [
      {
        name: 'Zorunlu Staj Belgesi',
        description:
          'Required by some companies; not mandatory for all students.',
        isRequired: false,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
      {
        name: 'Staj Başvuru Formu',
        description: 'Mandatory internship application form.',
        isRequired: true,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
      {
        name: 'Staj Ücretlerine İşsizlik Fonu Katkısı Öğrenci ve İşveren Bilgi Formu',
        description: 'Not everyone fills it.',
        isRequired: false,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
      {
        name: 'Uzaktan Mesleki Staj Evrak',
        description: 'Not everyone fills it.',
        isRequired: false,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
      {
        name: 'Müstehaklık Belgesi (E-devlet Kapısı üzerinden temin edilebilir.)',
        description: 'Mandatory.',
        isRequired: true,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
      {
        name: 'Kimlik Fotokopisi',
        description: 'Mandatory.',
        isRequired: true,
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
      },
    ];

    for (const def of definitions) {
      const existing = await this.documentTypeRepository.findOne({
        where: { departmentId, name: def.name },
      });
      if (!existing) {
        const entity = this.documentTypeRepository.create({
          departmentId,
          ...def,
        });
        await this.documentTypeRepository.save(entity);
      }
    }
  }

  private async createUserIfNotExists(input: {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    departmentId: string | null;
    studentNumber: string | null;
  }): Promise<void> {
    let user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (user) {
      return;
    }

    const passwordHash = await argon2.hash('Test1234');
    user = this.userRepository.create({
      email: input.email,
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      departmentId: input.departmentId,
      studentNumber: input.studentNumber,
      isActive: true,
    });
    user = await this.userRepository.save(user);

    const securityState = this.securityStateRepository.create({
      userId: user.id,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
    });
    await this.securityStateRepository.save(securityState);
  }
}
