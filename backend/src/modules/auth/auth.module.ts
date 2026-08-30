import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';

import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { GetMeUseCase } from '../../application/use-cases/auth/get-me.use-case';
import { PasswordResetRequestUseCase } from '../../application/use-cases/auth/password-reset-request.use-case';
import { PasswordResetConfirmUseCase } from '../../application/use-cases/auth/password-reset-confirm.use-case';

import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from '../../infrastructure/repositories/password-reset-token.repository';
import { UserSecurityStateRepository } from '../../infrastructure/repositories/user-security-state.repository';

import { Argon2PasswordHasherService } from '../../infrastructure/services/argon2-password-hasher.service';
import { CryptoTokenGeneratorService } from '../../infrastructure/services/crypto-token-generator.service';
import { JwtServiceAdapter } from '../../infrastructure/services/jwt.service';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { EnvConfigProvider } from '../../infrastructure/services/env-config-provider.service';
import { ConsoleEmailSenderService } from '../../infrastructure/services/console-email-sender.service';

import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { SessionEntity } from '../../infrastructure/database/entities/session.entity';
import { RefreshTokenEntity } from '../../infrastructure/database/entities/refresh-token.entity';
import { PasswordResetTokenEntity } from '../../infrastructure/database/entities/password-reset-token.entity';
import { UserSecurityStateEntity } from '../../infrastructure/database/entities/user-security-state.entity';

// Ports tokens (if needed, but we can bind directly to classes)
const REPOSITORIES = [
  { provide: 'IUserRepository', useClass: UserRepository },
  { provide: 'ISessionRepository', useClass: SessionRepository },
  { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },
  {
    provide: 'IPasswordResetTokenRepository',
    useClass: PasswordResetTokenRepository,
  },
  {
    provide: 'IUserSecurityStateRepository',
    useClass: UserSecurityStateRepository,
  },
];

const SERVICES = [
  { provide: 'IPasswordHasher', useClass: Argon2PasswordHasherService },
  { provide: 'ITokenGenerator', useClass: CryptoTokenGeneratorService },
  { provide: 'IJwtService', useClass: JwtServiceAdapter },
  { provide: 'IDateProvider', useClass: SystemDateProvider },
  { provide: 'IConfigProvider', useClass: EnvConfigProvider },
  { provide: 'IEmailSender', useClass: ConsoleEmailSenderService },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      RefreshTokenEntity,
      PasswordResetTokenEntity,
      UserSecurityStateEntity,
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    ...REPOSITORIES,
    ...SERVICES,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    PasswordResetRequestUseCase,
    PasswordResetConfirmUseCase,
    AuthGuard,
    CsrfGuard,
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
