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

  async execute(departmentId?: string, filters: { search?: string; year?: string; sortDir?: string } = {}): Promise<HolidayListItem[]> {
    const holidays = departmentId
      ? await this.holidayRepository.findByDepartment(departmentId)
      : await this.holidayRepository.findAll();

    const items = holidays.map((holiday) => ({
      id: holiday.id,
      departmentId: holiday.departmentId,
      holidayDate: holiday.holidayDate.toISOString().slice(0, 10),
      name: holiday.name,
    }));
    const filtered = items.filter((item) => (!filters.search || item.name.toLocaleLowerCase('tr-TR').includes(filters.search.toLocaleLowerCase('tr-TR'))) && (!filters.year || item.holidayDate.startsWith(filters.year)));
    return filtered.sort((a, b) => filters.sortDir === 'asc' ? a.holidayDate.localeCompare(b.holidayDate) : b.holidayDate.localeCompare(a.holidayDate));
  }
}
