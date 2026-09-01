import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AcademicCalendarController } from './academic-calendar.controller';
import { ListCalendarsUseCase } from '../../application/use-cases/calendar/list-calendars.use-case';
import { CreateCalendarUseCase } from '../../application/use-cases/calendar/create-calendar.use-case';
import { UpdateCalendarUseCase } from '../../application/use-cases/calendar/update-calendar.use-case';
import { DeleteCalendarUseCase } from '../../application/use-cases/calendar/delete-calendar.use-case';
import { GetNextTermUseCase } from '../../application/use-cases/calendar/get-next-term.use-case';
import { AcademicCalendarRepository } from '../../infrastructure/repositories/academic-calendar.repository';
import { AcademicCalendarEntity } from '../../infrastructure/database/entities/academic-calendar.entity';
import { IAcademicCalendarRepository } from '../../application/ports/academic-calendar.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AcademicCalendarEntity])],
  controllers: [AcademicCalendarController],
  providers: [
    {
      provide: IAcademicCalendarRepository,
      useClass: AcademicCalendarRepository,
    },
    { provide: IDateProvider, useClass: SystemDateProvider },
    ListCalendarsUseCase,
    CreateCalendarUseCase,
    UpdateCalendarUseCase,
    DeleteCalendarUseCase,
    GetNextTermUseCase,
    RolesGuard,
  ],
  exports: [IAcademicCalendarRepository],
})
export class AcademicCalendarModule {}
