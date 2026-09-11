import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOutboxEntity, OutboxStatus } from '../../../infrastructure/database/entities/notification-outbox.entity';

export interface CreateUserInput {
  email: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  studentNumber?: string | null;
  departmentId?: string | null;
}

export interface CreateUserResult {
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
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityStateRepository: IUserSecurityStateRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly dateProvider: IDateProvider,
    @InjectRepository(NotificationOutboxEntity) private readonly outboxRepository: Repository<NotificationOutboxEntity>,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserResult> {
    const email = new Email(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new DomainException(
        'CONFLICT',
        'User with this email already exists',
        409,
      );
    }

    const temporaryPassword = input.password ?? `Kt${randomBytes(9).toString('base64url')}7a`;
    const password = new Password(temporaryPassword);
    if (!input.password) this.logger.warn(`[UserCreate] Temporary password for ${input.email}: ${temporaryPassword}`);
    const role = new Role(input.role);
    if (role.getValue() === UserRole.ADMIN) { input.departmentId = null; input.studentNumber = null; }
    else if (!input.departmentId) throw new DomainException('VALIDATION_ERROR', 'Department is required for this role', 400);
    if (role.getValue() === UserRole.STUDENT && !input.studentNumber) throw new DomainException('VALIDATION_ERROR', 'Student number is required for students', 400);

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
      null, // profilePhotoPath
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
    if (!input.password) await this.outboxRepository.save({ recipientEmail: input.email, subject: 'KTÜN IMAS - Hesabınız Oluşturuldu', body: `<p>Sayın ${input.firstName} ${input.lastName},</p><p>KTÜN IMAS sistemine kaydınız oluşturulmuştur.</p><p><strong>E-posta:</strong> ${input.email}<br/><strong>Geçici Şifre:</strong> ${temporaryPassword}</p><p>İlk girişten sonra şifrenizi değiştirmeniz istenecektir.</p>`, status: OutboxStatus.PENDING });

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
