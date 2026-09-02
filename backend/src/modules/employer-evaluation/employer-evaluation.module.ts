import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InternshipModule } from '../internship/internship.module';
import { CompanyModule } from '../company/company.module';
import { EmployerEvaluationController } from './employer-evaluation.controller';
import { PublicEmployerEvaluationController } from './public-employer-evaluation.controller';
import { EmployerTokenEntity } from '../../infrastructure/database/entities/employer-token.entity';
import { EmployerEvaluationEntity } from '../../infrastructure/database/entities/employer-evaluation.entity';
import { EmployerTokenRepository } from '../../infrastructure/repositories/employer-token.repository';
import { EmployerEvaluationRepository } from '../../infrastructure/repositories/employer-evaluation.repository';
import { IEmployerTokenRepository } from '../../application/ports/employer-token.repository.port';
import { IEmployerEvaluationRepository } from '../../application/ports/employer-evaluation.repository.port';
import { IFileStorage } from '../../application/ports/file-storage.port';
import { LocalFileStorageService } from '../../infrastructure/services/local-file-storage.service';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { GenerateEvaluationLinkUseCase } from '../../application/use-cases/employer-evaluation/generate-evaluation-link.use-case';
import { ValidateEmployerTokenUseCase } from '../../application/use-cases/employer-evaluation/validate-employer-token.use-case';
import { SubmitDigitalEvaluationUseCase } from '../../application/use-cases/employer-evaluation/submit-digital-evaluation.use-case';
import { CreateManualEvaluationUseCase } from '../../application/use-cases/employer-evaluation/create-manual-evaluation.use-case';
import { GetEmployerEvaluationUseCase } from '../../application/use-cases/employer-evaluation/get-employer-evaluation.use-case';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    InternshipModule,
    CompanyModule,
    TypeOrmModule.forFeature([EmployerTokenEntity, EmployerEvaluationEntity]),
  ],
  controllers: [
    EmployerEvaluationController,
    PublicEmployerEvaluationController,
  ],
  providers: [
    { provide: IEmployerTokenRepository, useClass: EmployerTokenRepository },
    {
      provide: IEmployerEvaluationRepository,
      useClass: EmployerEvaluationRepository,
    },
    { provide: IFileStorage, useClass: LocalFileStorageService },
    { provide: IDateProvider, useClass: SystemDateProvider },
    GenerateEvaluationLinkUseCase,
    ValidateEmployerTokenUseCase,
    SubmitDigitalEvaluationUseCase,
    CreateManualEvaluationUseCase,
    GetEmployerEvaluationUseCase,
    RolesGuard,
  ],
  exports: [IEmployerEvaluationRepository],
})
export class EmployerEvaluationModule {}
