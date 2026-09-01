import { Injectable } from '@nestjs/common';
import { IHolidayRepository } from '../../ports/holiday.repository.port';

export interface HolidayListItem {
  id: string;
  departmentId: string | null;
  holidayDate: string;
  name: string;
}

@Injectable()
export class ListHolidaysUseCase {
  constructor(private readonly holidayRepository: IHolidayRepository) {}

  async execute(departmentId?: string): Promise<HolidayListItem[]> {
    const holidays = departmentId
      ? await this.holidayRepository.findByDepartment(departmentId)
      : await this.holidayRepository.findAll();

    return holidays.map((holiday) => ({
      id: holiday.id,
      departmentId: holiday.departmentId,
      holidayDate: holiday.holidayDate.toISOString().slice(0, 10),
      name: holiday.name,
    }));
  }
}
