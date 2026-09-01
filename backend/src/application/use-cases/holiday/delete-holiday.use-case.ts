import { Injectable } from '@nestjs/common';
import { IHolidayRepository } from '../../ports/holiday.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteHolidayUseCase {
  constructor(private readonly holidayRepository: IHolidayRepository) {}

  async execute(holidayId: string): Promise<void> {
    const existing = await this.holidayRepository.findById(holidayId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Holiday not found', 404);
    }
    await this.holidayRepository.delete(holidayId);
  }
}
