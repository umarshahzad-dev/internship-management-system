import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Holiday } from '../../../domain/entities/holiday.entity';
import { IHolidayRepository } from '../../ports/holiday.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';

export interface CreateHolidayInput {
  departmentId: string | null;
  holidayDate: Date;
  name: string;
}

export interface CreateHolidayResult {
  id: string;
  departmentId: string | null;
  holidayDate: string;
  name: string;
}

@Injectable()
export class CreateHolidayUseCase {
  constructor(
    private readonly holidayRepository: IHolidayRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: CreateHolidayInput): Promise<CreateHolidayResult> {
    const now = this.dateProvider.now();
    const holiday = new Holiday(
      randomUUID(),
      input.departmentId,
      input.holidayDate,
      input.name,
      now,
      now,
    );

    const saved = await this.holidayRepository.create(holiday);
    return {
      id: saved.id,
      departmentId: saved.departmentId,
      holidayDate: saved.holidayDate.toISOString().slice(0, 10),
      name: saved.name,
    };
  }
}
