import { Injectable, Optional } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Role, UserRole } from '../../../domain/value-objects/role.vo';
import { IUserRepository } from '../../ports/user.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { IDepartmentRepository } from '../../ports/department.repository.port';

export interface UpdateUserInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  studentNumber?: string | null;
  departmentId?: string | null;
}

export interface UpdateUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: string | null;
  studentNumber: string | null;
  isActive: boolean;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly dateProvider: IDateProvider,
    @Optional() private readonly departmentRepository?: IDepartmentRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserResult> {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'User not found', 404);
    }

    const now = this.dateProvider.now();
    const role = input.role ? new Role(input.role) : existing.role;
    const firstName = input.firstName ?? existing.firstName;
    const lastName = input.lastName ?? existing.lastName;
    const isActive = input.isActive ?? existing.isActive;
    let studentNumber =
      input.studentNumber !== undefined
        ? input.studentNumber
        : existing.studentNumber;
    let departmentId =
      input.departmentId !== undefined ? input.departmentId : existing.departmentId;
    if (role.getValue() === UserRole.ADMIN) {
      if (input.role && input.role !== existing.role.getValue()) {
        // Admin accounts never retain student or department scope.
        studentNumber = null;
        departmentId = null;
      }
    } else if (!departmentId) {
      throw new DomainException('VALIDATION_ERROR', 'Department is required for this role', 400);
    }
    if (role.getValue() === UserRole.STUDENT && !studentNumber) {
      throw new DomainException('VALIDATION_ERROR', 'Student number is required for students', 400);
    }
    if (departmentId) {
      const department = await this.departmentRepository?.findById(departmentId);
      if (!department) {
        throw new DomainException('VALIDATION_ERROR', 'Department not found', 400);
      }
    }

    const updatedUser = new User(
      existing.id,
      departmentId,
      existing.email,
      existing.passwordHash,
      role,
      firstName,
      lastName,
      studentNumber,
      existing.profilePhotoPath,
      isActive,
      existing.lastLogin,
      existing.createdAt,
      now,
    );

    const savedUser = await this.userRepository.update(updatedUser);

    return {
      id: savedUser.id,
      email: savedUser.email.toValue(),
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role.getValue(),
      departmentId: savedUser.departmentId,
      studentNumber: savedUser.studentNumber,
      isActive: savedUser.isActive,
    };
  }
}
