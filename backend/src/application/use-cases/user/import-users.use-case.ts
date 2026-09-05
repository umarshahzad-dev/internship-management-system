import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import * as Papa from 'papaparse';
import { User } from '../../../domain/entities/user.entity';
import { UserSecurityState } from '../../../domain/entities/user-security-state.entity';
import { Department } from '../../../domain/entities/department.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Role, UserRole } from '../../../domain/value-objects/role.vo';
import { IUserRepository } from '../../ports/user.repository.port';
import { IUserSecurityStateRepository } from '../../ports/user-security-state.repository.port';
import { IDepartmentRepository } from '../../ports/department.repository.port';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { isUUID } from 'class-validator';

export interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
}

interface CsvRow {
  email: string;
  password: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentNumber: string | null;
  departmentId: string;
}

@Injectable()
export class ImportUsersUseCase {
  private readonly logger = new Logger(ImportUsersUseCase.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityStateRepository: IUserSecurityStateRepository,
    private readonly departmentRepository: IDepartmentRepository,
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
      const rawRow = parseResult.data[i];
      const rowNumber = i + 2; // header is row 1

      try {
        // Trim all cell values
        const row: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawRow)) {
          row[key] = String(value).trim();
        }

        const csvRow = await this.validateAndMapRow(row);
        const existingUser =
          await this.userRepository.findByDepartmentAndStudentNumber(
            csvRow.departmentId,
            csvRow.studentNumber,
          );

        if (existingUser) {
          // Update existing user (ignore password)
          const updatedUser = new User(
            existingUser.id,
            existingUser.departmentId,
            new Email(csvRow.email),
            existingUser.passwordHash,
            new Role(csvRow.role),
            csvRow.firstName,
            csvRow.lastName,
            csvRow.studentNumber ?? existingUser.studentNumber,
            existingUser.profilePhotoPath,
            existingUser.isActive,
            existingUser.lastLogin,
            existingUser.createdAt,
            this.dateProvider.now(),
          );
          await this.userRepository.update(updatedUser);
        } else {
          // New user: generate random password and hash
          const generatedPassword = this.generateSecurePassword();
          const passwordHash =
            await this.passwordHasher.hash(generatedPassword);
          const user = new User(
            randomUUID(),
            csvRow.departmentId,
            new Email(csvRow.email),
            passwordHash,
            new Role(csvRow.role),
            csvRow.firstName,
            csvRow.lastName,
            csvRow.studentNumber,
            null, // profilePhotoPath
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

          // Log generated temporary password (will be replaced with email later)
          this.logger.warn(
            `Imported new user ${csvRow.email} with temporary password: ${generatedPassword}`,
          );
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

  private async validateAndMapRow(
    row: Record<string, string>,
  ): Promise<CsvRow> {
    const email = row['email'];
    const password = row['password'] || null;
    const role = row['role'] as UserRole;
    const firstName = row['firstname'] || row['first_name'];
    const lastName = row['lastname'] || row['last_name'];
    const studentNumber = row['studentnumber'] || row['student_number'] || null;
    const departmentValue =
      row['department'] || row['departmentid'] || row['department_id'];

    if (!email) throw new Error('Missing email');
    if (!role) throw new Error('Missing role');
    if (!firstName) throw new Error('Missing first name');
    if (!lastName) throw new Error('Missing last name');
    if (!departmentValue) throw new Error('Missing department');

    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    // Resolve department
    let departmentId: string;
    if (isUUID(departmentValue)) {
      departmentId = departmentValue;
    } else {
      let department =
        await this.departmentRepository.findByName(departmentValue);
      if (!department) {
        department = await this.departmentRepository.create(
          new Department(
            randomUUID(),
            departmentValue,
            'Engineering',
            this.dateProvider.now(),
            this.dateProvider.now(),
          ),
        );
      }
      departmentId = department.id;
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

  private generateSecurePassword(): string {
    const length = 12;
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const all = lower + upper + digits;

    let password = '';
    // Ensure at least one of each required type
    password += lower[randomBytes(1)[0] % lower.length];
    password += upper[randomBytes(1)[0] % upper.length];
    password += digits[randomBytes(1)[0] % digits.length];

    for (let i = 3; i < length; i++) {
      password += all[randomBytes(1)[0] % all.length];
    }

    // Shuffle password (Fisher-Yates)
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = randomBytes(1)[0] % (i + 1);
      [passwordArray[i], passwordArray[j]] = [
        passwordArray[j],
        passwordArray[i],
      ];
    }
    return passwordArray.join('');
  }
}
