import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicCalendar } from '../../domain/entities/academic-calendar.entity';
import { IAcademicCalendarRepository } from '../../application/ports/academic-calendar.repository.port';
import { AcademicCalendarEntity } from '../database/entities/academic-calendar.entity';
import { AcademicCalendarMapper } from '../mappers/academic-calendar.mapper';

@Injectable()
export class AcademicCalendarRepository extends IAcademicCalendarRepository {
  constructor(
    @InjectRepository(AcademicCalendarEntity)
    private readonly calendarRepository: Repository<AcademicCalendarEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<AcademicCalendar | null> {
    const entity = await this.calendarRepository.findOne({ where: { id } });
    return entity ? AcademicCalendarMapper.toDomain(entity) : null;
  }

  async findByDepartment(departmentId: string): Promise<AcademicCalendar[]> {
    const entities = await this.calendarRepository.find({
      where: { departmentId },
      order: { internshipStart: 'ASC' },
    });
    return entities.map(AcademicCalendarMapper.toDomain);
  }

  async findNextTerm(
    departmentId: string,
    now: Date,
  ): Promise<AcademicCalendar | null> {
    const entity = await this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.department_id = :departmentId', { departmentId })
      .andWhere('calendar.internship_start > :now', { now })
      .orderBy('calendar.internship_start', 'ASC')
      .getOne();
    return entity ? AcademicCalendarMapper.toDomain(entity) : null;
  }

  async create(calendar: AcademicCalendar): Promise<AcademicCalendar> {
    const entity = AcademicCalendarMapper.toPersistence(calendar);
    const saved = await this.calendarRepository.save(entity);
    return AcademicCalendarMapper.toDomain(saved);
  }

  async update(calendar: AcademicCalendar): Promise<AcademicCalendar> {
    const entity = AcademicCalendarMapper.toPersistence(calendar);
    await this.calendarRepository.update({ id: calendar.id }, entity);
    const updated = await this.calendarRepository.findOne({
      where: { id: calendar.id },
    });
    return updated ? AcademicCalendarMapper.toDomain(updated) : calendar;
  }

  async delete(id: string): Promise<void> {
    await this.calendarRepository.delete({ id });
  }
}
