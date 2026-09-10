import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ReportController } from './report.controller';
import { GenerateInternshipCsvUseCase } from '../../application/use-cases/report/generate-internship-csv.use-case';
import { GetInternshipSummaryUseCase } from '../../application/use-cases/report/get-internship-summary.use-case';
import { IReportRepository } from '../../application/ports/report.repository.port';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [ReportController],
  providers: [
    { provide: IReportRepository, useClass: ReportRepository },
    GenerateInternshipCsvUseCase,
    GetInternshipSummaryUseCase,
    RolesGuard,
  ],
  exports: [IReportRepository],
})
export class ReportModule {}
