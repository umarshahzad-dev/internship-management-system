import { FinalGrade } from '../../domain/entities/final-grade.entity';

export abstract class IFinalGradeRepository {
  abstract findByInternship(internshipId: string): Promise<FinalGrade | null>;
  abstract create(grade: FinalGrade): Promise<FinalGrade>;
  abstract update(grade: FinalGrade): Promise<FinalGrade>;
}
