import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SgkTracking } from '../../domain/entities/sgk-tracking.entity';
import { ISgkTrackingRepository } from '../../application/ports/sgk-tracking.repository.port';
import { SgkTrackingEntity } from '../database/entities/sgk-tracking.entity';
import { SgkTrackingMapper } from '../mappers/sgk-tracking.mapper';

@Injectable()
export class SgkTrackingRepository extends ISgkTrackingRepository {
  constructor(
    @InjectRepository(SgkTrackingEntity)
    private readonly sgkTrackingRepository: Repository<SgkTrackingEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<SgkTracking | null> {
    const entity = await this.sgkTrackingRepository.findOne({ where: { id } });
    return entity ? SgkTrackingMapper.toDomain(entity) : null;
  }

  async findByInternship(internshipId: string): Promise<SgkTracking | null> {
    const entity = await this.sgkTrackingRepository.findOne({
      where: { internshipId },
    });
    return entity ? SgkTrackingMapper.toDomain(entity) : null;
  }

  async create(tracking: SgkTracking): Promise<SgkTracking> {
    const entity = SgkTrackingMapper.toPersistence(tracking);
    const saved = await this.sgkTrackingRepository.save(entity);
    return SgkTrackingMapper.toDomain(saved);
  }

  async update(tracking: SgkTracking): Promise<SgkTracking> {
    const entity = SgkTrackingMapper.toPersistence(tracking);
    await this.sgkTrackingRepository.update({ id: tracking.id }, entity);
    const updated = await this.sgkTrackingRepository.findOne({
      where: { id: tracking.id },
    });
    return updated ? SgkTrackingMapper.toDomain(updated) : tracking;
  }

  async findAllByDepartment(departmentId: string): Promise<SgkTracking[]> {
    const entities = await this.sgkTrackingRepository
      .createQueryBuilder('sgk')
      .innerJoin('sgk.internship', 'internship')
      .where('internship.department_id = :departmentId', { departmentId })
      .orderBy('sgk.created_at', 'DESC')
      .getMany();
    return entities.map(SgkTrackingMapper.toDomain);
  }
}
