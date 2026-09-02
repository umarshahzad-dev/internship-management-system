import { EmployerEvaluation } from '../../domain/entities/employer-evaluation.entity';
import { EmployerEvaluationEntity } from '../database/entities/employer-evaluation.entity';

export class EmployerEvaluationMapper {
  static toDomain(entity: EmployerEvaluationEntity): EmployerEvaluation {
    return new EmployerEvaluation(
      entity.id,
      entity.internshipId,
      entity.method,
      entity.employerName,
      entity.enteredBy,
      entity.grades,
      entity.comments,
      entity.scannedSicilFisiPath,
      entity.submittedAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: EmployerEvaluation): EmployerEvaluationEntity {
    const entity = new EmployerEvaluationEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.method = domain.method;
    entity.employerName = domain.employerName;
    entity.enteredBy = domain.enteredBy;
    entity.grades = domain.grades;
    entity.comments = domain.comments;
    entity.scannedSicilFisiPath = domain.scannedSicilFisiPath;
    entity.submittedAt = domain.submittedAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
