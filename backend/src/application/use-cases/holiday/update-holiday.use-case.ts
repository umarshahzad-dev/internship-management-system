import { Injectable } from '@nestjs/common';
import { Holiday } from '../../../domain/entities/holiday.entity';
import { IHolidayRepository } from '../../ports/holiday.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface UpdateHolidayInput {
  holidayId: string;
  departmentId?: string | null;
  holidayDate?: Date;
  name?: string;
}

export interface UpdateHolidayResult {
  id: string;
  departmentId: string | null;
  holidayDate: string;
  name: string;
}

@Injectable()
export class UpdateHolidayUseCase {
  constructor(
    private readonly holidayRepository: IHolidayRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(input: UpdateHolidayInput): Promise<UpdateHolidayResult> {
    const existing = await this.holidayRepository.findById(input.holidayId);
    if (!existing) {
      throw new DomainException('NOT_FOUND', 'Holiday not found', 404);
    }

    const now = this.dateProvider.now();
    const updated = new Holiday(
      existing.id,
      input.departmentId !== undefined
        ? input.departmentId
        : existing.departmentId,
      input.holidayDate ?? existing.holidayDate,
      input.name ?? existing.name,
      existing.createdAt,
      now,
    );

    const saved = await this.holidayRepository.update(updated);
    return {
      id: saved.id,
      departmentId: saved.departmentId,
      holidayDate: saved.holidayDate.toISOString().slice(0, 10),
      name: saved.name,
    };
  }
}
