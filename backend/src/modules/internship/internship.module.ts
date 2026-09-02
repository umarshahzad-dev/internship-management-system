import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InternshipController } from './internship.controller';
import { InternshipEntity } from '../../infrastructure/database/entities/internship.entity';
import { InternshipStatusHistoryEntity } from '../../infrastructure/database/entities/internship-status-history.entity';
import { InternshipRepository } from '../../infrastructure/repositories/internship.repository';
import { InternshipStatusHistoryRepository } from '../../infrastructure/repositories/internship-status-history.repository';
import { IInternshipRepository } from '../../application/ports/internship.repository.port';
import { IInternshipStatusHistoryRepository } from '../../application/ports/internship-status-history.repository.port';
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
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([InternshipEntity, InternshipStatusHistoryEntity]),
  ],
  controllers: [InternshipController],
  providers: [
    { provide: IInternshipRepository, useClass: InternshipRepository },
    {
      provide: IInternshipStatusHistoryRepository,
      useClass: InternshipStatusHistoryRepository,
    },
    { provide: IDateProvider, useClass: SystemDateProvider },
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
    RolesGuard,
  ],
  exports: [IInternshipRepository, IInternshipStatusHistoryRepository],
})
export class InternshipModule {}
