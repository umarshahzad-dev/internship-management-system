import { FinalGrade } from '../../domain/entities/final-grade.entity';
import { FinalGradeEntity } from '../database/entities/final-grade.entity';

export class FinalGradeMapper {
  static toDomain(entity: FinalGradeEntity): FinalGrade {
    return new FinalGrade(
      entity.id,
      entity.internshipId,
      Number(entity.employerScore),
      Number(entity.academicScore),
      Number(entity.finalScore),
      entity.letterGrade,
      entity.calculatedAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: FinalGrade): FinalGradeEntity {
    const entity = new FinalGradeEntity();
    entity.id = domain.id;
    entity.internshipId = domain.internshipId;
    entity.employerScore = domain.employerScore;
    entity.academicScore = domain.academicScore;
    entity.finalScore = domain.finalScore;
    entity.letterGrade = domain.letterGrade;
    entity.calculatedAt = domain.calculatedAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
