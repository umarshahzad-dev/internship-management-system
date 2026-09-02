import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Internship } from '../../domain/entities/internship.entity';
import { IInternshipRepository } from '../../application/ports/internship.repository.port';
import { InternshipEntity } from '../database/entities/internship.entity';
import { InternshipMapper } from '../mappers/internship.mapper';
import { InternshipStatus } from '../../domain/enums/internship-status.enum';

@Injectable()
export class InternshipRepository extends IInternshipRepository {
  private readonly activeStatuses = [
    InternshipStatus.DRAFT,
    InternshipStatus.APPLIED,
    InternshipStatus.REVISION,
    InternshipStatus.APPROVED,
    InternshipStatus.ONGOING,
    InternshipStatus.EVALUATION,
  ];

  constructor(
    @InjectRepository(InternshipEntity)
    private readonly internshipRepository: Repository<InternshipEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Internship | null> {
    const entity = await this.internshipRepository.findOne({ where: { id } });
    return entity ? InternshipMapper.toDomain(entity) : null;
  }

  async findAllByStudent(studentId: string): Promise<Internship[]> {
    const entities = await this.internshipRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(InternshipMapper.toDomain);
  }

  async findAllByDepartment(departmentId: string): Promise<Internship[]> {
    const entities = await this.internshipRepository.find({
      where: { departmentId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(InternshipMapper.toDomain);
  }

  async findActiveByStudent(studentId: string): Promise<Internship[]> {
    const entities = await this.internshipRepository.find({
      where: {
        studentId,
        status: In(this.activeStatuses),
      },
    });
    return entities.map(InternshipMapper.toDomain);
  }

  async create(internship: Internship): Promise<Internship> {
    const entity = InternshipMapper.toPersistence(internship);
    const saved = await this.internshipRepository.save(entity);
    return InternshipMapper.toDomain(saved);
  }

  async update(internship: Internship): Promise<Internship> {
    const entity = InternshipMapper.toPersistence(internship);
    await this.internshipRepository.update({ id: internship.id }, entity);
    const updated = await this.internshipRepository.findOne({
      where: { id: internship.id },
    });
    return updated ? InternshipMapper.toDomain(updated) : internship;
  }
}
