import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InternshipModule } from '../internship/internship.module';
import { EmployerEvaluationModule } from '../employer-evaluation/employer-evaluation.module';
import { ScoringController } from './scoring.controller';
import { EnterAcademicScoreUseCase } from '../../application/use-cases/scoring/enter-academic-score.use-case';
import { GetFinalGradeUseCase } from '../../application/use-cases/scoring/get-final-grade.use-case';
import { FinalGradeEntity } from '../../infrastructure/database/entities/final-grade.entity';
import { FinalGradeRepository } from '../../infrastructure/repositories/final-grade.repository';
import { IFinalGradeRepository } from '../../application/ports/final-grade.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    InternshipModule,
    EmployerEvaluationModule,
    TypeOrmModule.forFeature([FinalGradeEntity]),
  ],
  controllers: [ScoringController],
  providers: [
    { provide: IFinalGradeRepository, useClass: FinalGradeRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    EnterAcademicScoreUseCase,
    GetFinalGradeUseCase,
    RolesGuard,
  ],
  exports: [IFinalGradeRepository],
})
export class ScoringModule {}
