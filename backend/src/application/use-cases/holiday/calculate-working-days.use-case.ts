import { Injectable } from '@nestjs/common';
import { IHolidayRepository } from '../../ports/holiday.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface CalculateWorkingDaysInput {
  departmentId: string;
  startDate: Date;
  endDate: Date;
  includeSaturdays: boolean;
}

export interface CalculateWorkingDaysResult {
  totalDays: number;
  holidaysEncountered: string[];
}

@Injectable()
export class CalculateWorkingDaysUseCase {
  constructor(private readonly holidayRepository: IHolidayRepository) {}

  async execute(
    input: CalculateWorkingDaysInput,
  ): Promise<CalculateWorkingDaysResult> {
    if (input.endDate < input.startDate) {
      throw new DomainException(
        'VALIDATION_ERROR',
        'End date cannot be before start date',
        400,
      );
    }

    const holidays = await this.holidayRepository.findBetweenDates(
      input.startDate,
      input.endDate,
      input.departmentId,
    );

    const holidayDateStrings = new Set(
      holidays.map((h) => h.holidayDate.toISOString().slice(0, 10)),
    );

    let totalWorkingDays = 0;
    const holidaysEncountered: string[] = [];
    const currentDate = new Date(input.startDate);

    while (currentDate <= input.endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateString = currentDate.toISOString().slice(0, 10);

      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isWeekend = isSunday || (isSaturday && !input.includeSaturdays);
      const isHoliday = holidayDateStrings.has(dateString);

      if (isHoliday) {
        holidaysEncountered.push(dateString);
      } else if (!isWeekend) {
        totalWorkingDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { totalDays: totalWorkingDays, holidaysEncountered };
  }
}
