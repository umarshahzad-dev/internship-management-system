import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from '../../domain/entities/holiday.entity';
import { IHolidayRepository } from '../../application/ports/holiday.repository.port';
import { HolidayEntity } from '../database/entities/holiday.entity';
import { HolidayMapper } from '../mappers/holiday.mapper';

@Injectable()
export class HolidayRepository extends IHolidayRepository {
  constructor(
    @InjectRepository(HolidayEntity)
    private readonly holidayRepository: Repository<HolidayEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Holiday | null> {
    const entity = await this.holidayRepository.findOne({ where: { id } });
    return entity ? HolidayMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Holiday[]> {
    const entities = await this.holidayRepository.find({
      order: { holidayDate: 'ASC' },
    });
    return entities.map(HolidayMapper.toDomain);
  }

  async findByDepartment(departmentId: string): Promise<Holiday[]> {
    const entities = await this.holidayRepository
      .createQueryBuilder('holiday')
      .where(
        'holiday.department_id IS NULL OR holiday.department_id = :departmentId',
        {
          departmentId,
        },
      )
      .orderBy('holiday.holiday_date', 'ASC')
      .getMany();
    return entities.map(HolidayMapper.toDomain);
  }

  async findBetweenDates(
    start: Date,
    end: Date,
    departmentId: string,
  ): Promise<Holiday[]> {
    const entities = await this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.holiday_date >= :start', { start })
      .andWhere('holiday.holiday_date <= :end', { end })
      .andWhere(
        '(holiday.department_id IS NULL OR holiday.department_id = :departmentId)',
        { departmentId },
      )
      .orderBy('holiday.holiday_date', 'ASC')
      .getMany();
    return entities.map(HolidayMapper.toDomain);
  }

  async create(holiday: Holiday): Promise<Holiday> {
    const entity = HolidayMapper.toPersistence(holiday);
    const saved = await this.holidayRepository.save(entity);
    return HolidayMapper.toDomain(saved);
  }

  async update(holiday: Holiday): Promise<Holiday> {
    const entity = HolidayMapper.toPersistence(holiday);
    await this.holidayRepository.update({ id: holiday.id }, entity);
    const updated = await this.holidayRepository.findOne({
      where: { id: holiday.id },
    });
    return updated ? HolidayMapper.toDomain(updated) : holiday;
  }

  async delete(id: string): Promise<void> {
    await this.holidayRepository.delete({ id });
  }
}
