import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CompanyModule } from '../company/company.module';
import { InternshipController } from './internship.controller';
import { PublicInternshipController } from './public-internship.controller';
import { InternshipEntity } from '../../infrastructure/database/entities/internship.entity';
import { InternshipStatusHistoryEntity } from '../../infrastructure/database/entities/internship-status-history.entity';
import { DocumentTypeEntity } from '../../infrastructure/database/entities/document-type.entity';
import { ApplicationDocumentEntity } from '../../infrastructure/database/entities/application-document.entity';
import { EmployerTokenEntity } from '../../infrastructure/database/entities/employer-token.entity';
import { CompanyEntity } from '../../infrastructure/database/entities/company.entity';
import { SgkTrackingEntity } from '../../infrastructure/database/entities/sgk-tracking.entity';
import { InternshipRepository } from '../../infrastructure/repositories/internship.repository';
import { InternshipStatusHistoryRepository } from '../../infrastructure/repositories/internship-status-history.repository';
import { DocumentTypeRepository } from '../../infrastructure/repositories/document-type.repository';
import { ApplicationDocumentRepository } from '../../infrastructure/repositories/application-document.repository';
import { EmployerTokenRepository } from '../../infrastructure/repositories/employer-token.repository';
import { CompanyRepository } from '../../infrastructure/repositories/company.repository';
import { SgkTrackingRepository } from '../../infrastructure/repositories/sgk-tracking.repository';
import { IInternshipRepository } from '../../application/ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../application/ports/internship-status-history.repository.port';
import { IDocumentTypeRepository } from '../../application/ports/document-type.repository.port';
import { IApplicationDocumentRepository } from '../../application/ports/application-document.repository.port';
import { IEmployerTokenRepository } from '../../application/ports/employer-token.repository.port';
import { ICompanyRepository } from '../../application/ports/company.repository.port';
import { ISgkTrackingRepository } from '../../application/ports/sgk-tracking.repository.port';
import { ITokenGenerator } from '../../application/ports/token-generator.port';
import { IEmailSender } from '../../application/ports/email-sender.port';
import { IConfigProvider } from '../../application/ports/config-provider.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { IPdfCompiler } from '../../application/ports/pdf-compiler.port';
import { CreateDraftInternshipUseCase } from '../../application/use-cases/internship/create-draft-internship.use-case';
import { ListInternshipsUseCase } from '../../application/use-cases/internship/list-internships.use-case';
import { GetInternshipUseCase } from '../../application/use-cases/internship/get-internship.use-case';
import { UpdateDraftInternshipUseCase } from '../../application/use-cases/internship/update-draft-internship.use-case';
import { SubmitInternshipUseCase } from '../../application/use-cases/internship/submit-internship.use-case';
import { WithdrawInternshipUseCase } from '../../application/use-cases/internship/withdraw-internship.use-case';
import { ApproveInternshipUseCase } from '../../application/use-cases/internship/approve-internship.use-case';
import { RejectInternshipUseCase } from '../../application/use-cases/internship/reject-internship.use-case';
import { RequestRevisionInternshipUseCase } from '../../application/use-cases/internship/request-revision-internship.use-case';
import { GetInternshipHistoryUseCase } from '../../application/use-cases/internship/get-internship-history.use-case';
import { EmployerApproveApplicationUseCase } from '../../application/use-cases/internship/employer-approve-application.use-case';
import { CompleteInternshipUseCase } from '../../application/use-cases/internship/complete-internship.use-case';
import { FinalizeInternshipUseCase } from '../../application/use-cases/internship/finalize-internship.use-case';
import { VerifyInternshipSignatureUseCase } from '../../application/use-cases/internship/verify-internship-signature.use-case';
import { GenerateApplicationFormUseCase } from '../../application/use-cases/internship/generate-application-form.use-case';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { EnvConfigProvider } from '../../infrastructure/services/env-config-provider.service';
import { CryptoTokenGeneratorService } from '../../infrastructure/services/crypto-token-generator.service';
import { ConsoleEmailSenderService } from '../../infrastructure/services/console-email-sender.service';
import { TypstCompilerService } from '../../infrastructure/services/typst-compiler.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    CompanyModule,
    TypeOrmModule.forFeature([
      InternshipEntity,
      InternshipStatusHistoryEntity,
      DocumentTypeEntity,
      ApplicationDocumentEntity,
      EmployerTokenEntity,
      CompanyEntity,
      SgkTrackingEntity,
    ]),
  ],
  controllers: [InternshipController, PublicInternshipController],
  providers: [
    { provide: IInternshipRepository, useClass: InternshipRepository },
    {
      provide: IInternshipStatusHistoryRepository,
      useClass: InternshipStatusHistoryRepository,
    },
    { provide: IDocumentTypeRepository, useClass: DocumentTypeRepository },
    {
      provide: IApplicationDocumentRepository,
      useClass: ApplicationDocumentRepository,
    },
    { provide: IEmployerTokenRepository, useClass: EmployerTokenRepository },
    { provide: ICompanyRepository, useClass: CompanyRepository },
    { provide: ISgkTrackingRepository, useClass: SgkTrackingRepository },
    { provide: ITokenGenerator, useClass: CryptoTokenGeneratorService },
    { provide: IEmailSender, useClass: ConsoleEmailSenderService },
    { provide: IConfigProvider, useClass: EnvConfigProvider },
    { provide: IDateProvider, useClass: SystemDateProvider },
    { provide: IPdfCompiler, useClass: TypstCompilerService },
    CreateDraftInternshipUseCase,
    ListInternshipsUseCase,
    GetInternshipUseCase,
    UpdateDraftInternshipUseCase,
    SubmitInternshipUseCase,
    WithdrawInternshipUseCase,
    ApproveInternshipUseCase,
    RejectInternshipUseCase,
    RequestRevisionInternshipUseCase,
    GetInternshipHistoryUseCase,
    EmployerApproveApplicationUseCase,
    CompleteInternshipUseCase,
    FinalizeInternshipUseCase,
    VerifyInternshipSignatureUseCase,
    GenerateApplicationFormUseCase,
    RolesGuard,
  ],
  exports: [
    IInternshipRepository,
    IInternshipStatusHistoryRepository,
    IDocumentTypeRepository,
    IApplicationDocumentRepository,
    IEmployerTokenRepository,
    ICompanyRepository,
    ISgkTrackingRepository,
  ],
})
export class InternshipModule {}
