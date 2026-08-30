import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { DepartmentEntity } from '../infrastructure/database/entities/department.entity';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserSecurityStateEntity } from '../infrastructure/database/entities/user-security-state.entity';
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

    // Create users
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

    this.logger.log('Seeding completed.');
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
