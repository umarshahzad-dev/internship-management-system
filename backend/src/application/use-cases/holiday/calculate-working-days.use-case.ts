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
      holidays.map((h) => {
        const d = h.holidayDate;
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }),
    );

    let totalWorkingDays = 0;
    const holidaysEncountered: string[] = [];

    const currentDate = new Date(input.startDate);
    currentDate.setUTCHours(0, 0, 0, 0);

    const end = new Date(input.endDate);
    end.setUTCHours(0, 0, 0, 0);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getUTCDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isWeekend = isSunday || (isSaturday && !input.includeSaturdays);
      const isHoliday = holidayDateStrings.has(dateString);

      if (isHoliday) {
        holidaysEncountered.push(dateString);
      } else if (!isWeekend) {
        totalWorkingDays++;
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return { totalDays: totalWorkingDays, holidaysEncountered };
  }
}
