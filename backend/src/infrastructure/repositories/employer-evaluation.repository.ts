import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerEvaluation } from '../../domain/entities/employer-evaluation.entity';
import { IEmployerEvaluationRepository } from '../../application/ports/employer-evaluation.repository.port';
import { EmployerEvaluationEntity } from '../database/entities/employer-evaluation.entity';
import { EmployerEvaluationMapper } from '../mappers/employer-evaluation.mapper';

@Injectable()
export class EmployerEvaluationRepository extends IEmployerEvaluationRepository {
  constructor(
    @InjectRepository(EmployerEvaluationEntity)
    private readonly evaluationRepository: Repository<EmployerEvaluationEntity>,
  ) {
    super();
  }

  async findByInternship(
    internshipId: string,
  ): Promise<EmployerEvaluation | null> {
    const entity = await this.evaluationRepository.findOne({
      where: { internshipId },
    });
    return entity ? EmployerEvaluationMapper.toDomain(entity) : null;
  }

  async create(evaluation: EmployerEvaluation): Promise<EmployerEvaluation> {
    const entity = EmployerEvaluationMapper.toPersistence(evaluation);
    const saved = await this.evaluationRepository.save(entity);
    return EmployerEvaluationMapper.toDomain(saved);
  }
}
