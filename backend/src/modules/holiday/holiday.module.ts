import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { HolidayController } from './holiday.controller';
import { ListHolidaysUseCase } from '../../application/use-cases/holiday/list-holidays.use-case';
import { CreateHolidayUseCase } from '../../application/use-cases/holiday/create-holiday.use-case';
import { UpdateHolidayUseCase } from '../../application/use-cases/holiday/update-holiday.use-case';
import { DeleteHolidayUseCase } from '../../application/use-cases/holiday/delete-holiday.use-case';
import { HolidayRepository } from '../../infrastructure/repositories/holiday.repository';
import { HolidayEntity } from '../../infrastructure/database/entities/holiday.entity';
import { IHolidayRepository } from '../../application/ports/holiday.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { RolesGuard } from '../user/guards/roles.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([HolidayEntity])],
  controllers: [HolidayController],
  providers: [
    { provide: IHolidayRepository, useClass: HolidayRepository },
    { provide: IDateProvider, useClass: SystemDateProvider },
    ListHolidaysUseCase,
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    DeleteHolidayUseCase,
    RolesGuard,
  ],
  exports: [IHolidayRepository],
})
export class HolidayModule {}
