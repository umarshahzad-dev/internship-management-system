import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalGrade } from '../../domain/entities/final-grade.entity';
import { IFinalGradeRepository } from '../../application/ports/final-grade.repository.port';
import { FinalGradeEntity } from '../database/entities/final-grade.entity';
import { FinalGradeMapper } from '../mappers/final-grade.mapper';

@Injectable()
export class FinalGradeRepository extends IFinalGradeRepository {
  constructor(
    @InjectRepository(FinalGradeEntity)
    private readonly finalGradeRepository: Repository<FinalGradeEntity>,
  ) {
    super();
  }

  async findByInternship(internshipId: string): Promise<FinalGrade | null> {
    const entity = await this.finalGradeRepository.findOne({
      where: { internshipId },
    });
    return entity ? FinalGradeMapper.toDomain(entity) : null;
  }

  async create(grade: FinalGrade): Promise<FinalGrade> {
    const entity = FinalGradeMapper.toPersistence(grade);
    const saved = await this.finalGradeRepository.save(entity);
    return FinalGradeMapper.toDomain(saved);
  }

  async update(grade: FinalGrade): Promise<FinalGrade> {
    const entity = FinalGradeMapper.toPersistence(grade);
    await this.finalGradeRepository.update({ id: grade.id }, entity);
    const updated = await this.finalGradeRepository.findOne({
      where: { id: grade.id },
    });
    return updated ? FinalGradeMapper.toDomain(updated) : grade;
  }
}
