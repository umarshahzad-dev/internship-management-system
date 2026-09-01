import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as Papa from 'papaparse';
import { User } from '../../../domain/entities/user.entity';
import { UserSecurityState } from '../../../domain/entities/user-security-state.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { Role, UserRole } from '../../../domain/value-objects/role.vo';
import { IUserRepository } from '../../ports/user.repository.port';
import { IUserSecurityStateRepository } from '../../ports/user-security-state.repository.port';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
}

interface CsvRow {
  email: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  departmentId: string;
}

@Injectable()
export class ImportUsersUseCase {
  private readonly logger = new Logger(ImportUsersUseCase.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityStateRepository: IUserSecurityStateRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(fileBuffer: Buffer): Promise<ImportResult> {
    const csvContent = fileBuffer.toString('utf-8');
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      const rowNumber = i + 2; // header is row 1

      try {
        const csvRow = this.validateAndMapRow(row);
        const existingUser =
          await this.userRepository.findByDepartmentAndStudentNumber(
            csvRow.departmentId,
            csvRow.studentNumber || null,
          );

        if (existingUser) {
          // Update existing user (no password change)
          const updatedUser = new User(
            existingUser.id,
            existingUser.departmentId,
            new Email(csvRow.email),
            existingUser.passwordHash,
            new Role(csvRow.role),
            csvRow.firstName,
            csvRow.lastName,
            csvRow.studentNumber ?? existingUser.studentNumber,
            existingUser.isActive,
            existingUser.lastLogin,
            existingUser.createdAt,
            this.dateProvider.now(),
          );
          await this.userRepository.update(updatedUser);
        } else {
          // Create new user
          const passwordHash = await this.passwordHasher.hash(
            csvRow.password || 'DefaultPass123',
          );
          const user = new User(
            randomUUID(),
            csvRow.departmentId,
            new Email(csvRow.email),
            passwordHash,
            new Role(csvRow.role),
            csvRow.firstName,
            csvRow.lastName,
            csvRow.studentNumber ?? null,
            true,
            null,
            this.dateProvider.now(),
            this.dateProvider.now(),
          );
          const savedUser = await this.userRepository.create(user);

          const securityState = new UserSecurityState(
            savedUser.id,
            0,
            null,
            this.dateProvider.now(),
            this.dateProvider.now(),
          );
          await this.securityStateRepository.create(securityState);
        }

        imported++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ row: rowNumber, message });
      }
    }

    return { imported, errors };
  }

  private validateAndMapRow(row: Record<string, string>): CsvRow {
    const email = row['email'];
    const password = row['password'];
    const role = row['role'] as UserRole;
    const firstName = row['firstname'] || row['first_name'];
    const lastName = row['lastname'] || row['last_name'];
    const studentNumber = row['studentnumber'] || row['student_number'];
    const departmentId = row['departmentid'] || row['department_id'];

    if (!email) throw new Error('Missing email');
    if (!role) throw new Error('Missing role');
    if (!firstName) throw new Error('Missing first name');
    if (!lastName) throw new Error('Missing last name');
    if (!departmentId) throw new Error('Missing department ID');

    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    return {
      email,
      password,
      role,
      firstName,
      lastName,
      studentNumber,
      departmentId,
    };
  }
}
