import { Injectable } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteCalendarUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
  ) {}

  async execute(calendarId: string): Promise<void> {
    const existing = await this.calendarRepository.findById(calendarId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Calendar not found', 404);
    }
    await this.calendarRepository.delete(calendarId);
  }
}
