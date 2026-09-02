import { Injectable } from '@nestjs/common';
import { IEmployerEvaluationRepository } from '../../ports/employer-evaluation.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface GetEmployerEvaluationInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

export interface EmployerEvaluationResult {
  id: string;
  internshipId: string;
  method: string;
  employerName: string;
  enteredBy: string | null;
  grades: Record<string, any>;
  comments: string | null;
  scannedSicilFisiPath: string | null;
  submittedAt: string;
  updatedAt: string;
}

@Injectable()
export class GetEmployerEvaluationUseCase {
  constructor(
    private readonly employerEvaluationRepository: IEmployerEvaluationRepository,
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(
    input: GetEmployerEvaluationInput,
  ): Promise<EmployerEvaluationResult> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (input.currentUserRole === 'STUDENT') {
      if (internship.studentId !== input.currentUserId) {
        throw new DomainException(
          'FORBIDDEN',
          'Only owner can view evaluation',
          403,
        );
      }
    } else if (input.currentUserRole === 'ACADEMIC') {
      if (
        !input.currentUserDepartmentId ||
        internship.departmentId !== input.currentUserDepartmentId
      ) {
        throw new DomainException(
          'FORBIDDEN',
          'Academic cannot view other departments',
          403,
        );
      }
    } else {
      throw new DomainException(
        'FORBIDDEN',
        'Admin cannot view evaluations',
        403,
      );
    }

    const evaluation = await this.employerEvaluationRepository.findByInternship(
      input.internshipId,
    );
    if (!evaluation) {
      throw new DomainException('NOT_FOUND', 'Evaluation not found', 404);
    }

    return {
      id: evaluation.id,
      internshipId: evaluation.internshipId,
      method: evaluation.method,
      employerName: evaluation.employerName,
      enteredBy: evaluation.enteredBy,
      grades: evaluation.grades,
      comments: evaluation.comments,
      scannedSicilFisiPath: evaluation.scannedSicilFisiPath,
      submittedAt: evaluation.submittedAt.toISOString(),
      updatedAt: evaluation.updatedAt.toISOString(),
    };
  }
}
