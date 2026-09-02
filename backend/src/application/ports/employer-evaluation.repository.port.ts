import { EmployerEvaluation } from '../../domain/entities/employer-evaluation.entity';

export abstract class IEmployerEvaluationRepository {
  abstract findByInternship(
    internshipId: string,
  ): Promise<EmployerEvaluation | null>;
  abstract create(evaluation: EmployerEvaluation): Promise<EmployerEvaluation>;
}
