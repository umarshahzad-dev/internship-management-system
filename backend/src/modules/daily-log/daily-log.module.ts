import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InternshipModule } from '../internship/internship.module';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';
import { DailyLogController } from './daily-log.controller';
import { CreateDailyLogUseCase } from '../../application/use-cases/daily-log/create-daily-log.use-case';
import { ListDailyLogsUseCase } from '../../application/use-cases/daily-log/list-daily-logs.use-case';
import { UpdateDailyLogUseCase } from '../../application/use-cases/daily-log/update-daily-log.use-case';
import { GenerateStajDefteriUseCase } from '../../application/use-cases/daily-log/generate-staj-defteri.use-case';
import { DailyLogRepository } from '../../infrastructure/repositories/daily-log.repository';
import { DailyLogEntity } from '../../infrastructure/database/entities/daily-log.entity';
import { IDailyLogRepository } from '../../application/ports/daily-log.repository.port';
import { IPdfCompiler } from '../../application/ports/pdf-compiler.port';
import { TypstCompilerService } from '../../infrastructure/services/typst-compiler.service';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    InternshipModule,
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature([DailyLogEntity]),
  ],
  controllers: [DailyLogController],
  providers: [
    { provide: IDailyLogRepository, useClass: DailyLogRepository },
    { provide: IPdfCompiler, useClass: TypstCompilerService },
    { provide: IDateProvider, useClass: SystemDateProvider },
    CreateDailyLogUseCase,
    ListDailyLogsUseCase,
    UpdateDailyLogUseCase,
    GenerateStajDefteriUseCase,
    RolesGuard,
  ],
  exports: [IDailyLogRepository],
})
export class DailyLogModule {}
