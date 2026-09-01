import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';

// Use cases
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { GetMeUseCase } from '../../application/use-cases/auth/get-me.use-case';
import { PasswordResetRequestUseCase } from '../../application/use-cases/auth/password-reset-request.use-case';
import { PasswordResetConfirmUseCase } from '../../application/use-cases/auth/password-reset-confirm.use-case';

// Repositories
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from '../../infrastructure/repositories/password-reset-token.repository';
import { UserSecurityStateRepository } from '../../infrastructure/repositories/user-security-state.repository';

// Services
import { Argon2PasswordHasherService } from '../../infrastructure/services/argon2-password-hasher.service';
import { CryptoTokenGeneratorService } from '../../infrastructure/services/crypto-token-generator.service';
import { JwtServiceAdapter } from '../../infrastructure/services/jwt.service';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { EnvConfigProvider } from '../../infrastructure/services/env-config-provider.service';
import { ConsoleEmailSenderService } from '../../infrastructure/services/console-email-sender.service';

// Entities
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { SessionEntity } from '../../infrastructure/database/entities/session.entity';
import { RefreshTokenEntity } from '../../infrastructure/database/entities/refresh-token.entity';
import { PasswordResetTokenEntity } from '../../infrastructure/database/entities/password-reset-token.entity';
import { UserSecurityStateEntity } from '../../infrastructure/database/entities/user-security-state.entity';

// Ports
import { IUserRepository } from '../../application/ports/user.repository.port';
import { ISessionRepository } from '../../application/ports/session.repository.port';
import { IRefreshTokenRepository } from '../../application/ports/refresh-token.repository.port';
import { IPasswordResetTokenRepository } from '../../application/ports/password-reset-token.repository.port';
import { IUserSecurityStateRepository } from '../../application/ports/user-security-state.repository.port';
import { IPasswordHasher } from '../../application/ports/password-hasher.port';
import { ITokenGenerator } from '../../application/ports/token-generator.port';
import { IJwtService } from '../../application/ports/jwt.service.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { IConfigProvider } from '../../application/ports/config-provider.port';
import { IEmailSender } from '../../application/ports/email-sender.port';

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
    { provide: IUserRepository, useClass: UserRepository },
    { provide: ISessionRepository, useClass: SessionRepository },
    { provide: IRefreshTokenRepository, useClass: RefreshTokenRepository },
    {
      provide: IPasswordResetTokenRepository,
      useClass: PasswordResetTokenRepository,
    },
    {
      provide: IUserSecurityStateRepository,
      useClass: UserSecurityStateRepository,
    },
    { provide: IPasswordHasher, useClass: Argon2PasswordHasherService },
    { provide: ITokenGenerator, useClass: CryptoTokenGeneratorService },
    { provide: IJwtService, useClass: JwtServiceAdapter },
    { provide: IDateProvider, useClass: SystemDateProvider },
    { provide: IConfigProvider, useClass: EnvConfigProvider },
    { provide: IEmailSender, useClass: ConsoleEmailSenderService },
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    PasswordResetRequestUseCase,
    PasswordResetConfirmUseCase,
    AuthGuard,
    CsrfGuard,
  ],
  exports: [
    AuthGuard,
    CsrfGuard,
    IUserRepository,
    ISessionRepository,
    IRefreshTokenRepository,
    IPasswordResetTokenRepository,
    IUserSecurityStateRepository,
    IPasswordHasher,
    ITokenGenerator,
    IJwtService,
    IDateProvider,
    IConfigProvider,
    IEmailSender,
  ],
})
export class AuthModule {}
