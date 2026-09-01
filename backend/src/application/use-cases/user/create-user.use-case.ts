import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentNumber?: string | null;
  departmentId?: string | null;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityStateRepository: IUserSecurityStateRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = new Email(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new DomainException(
        'CONFLICT',
        'User with this email already exists',
        409,
      );
    }

    const password = new Password(input.password);
    const role = new Role(input.role);

    const now = this.dateProvider.now();
    const passwordHash = await this.passwordHasher.hash(password.toValue());

    const user = new User(
      randomUUID(),
      input.departmentId ?? null,
      email,
      passwordHash,
      role,
      input.firstName,
      input.lastName,
      input.studentNumber ?? null,
      true,
      null,
      now,
      now,
    );

    const savedUser = await this.userRepository.create(user);

    const securityState = new UserSecurityState(
      savedUser.id,
      0,
      null,
      now,
      now,
    );
    await this.securityStateRepository.create(securityState);

    return savedUser;
  }
}
