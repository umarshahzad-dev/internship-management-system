import { Injectable } from '@nestjs/common';
import { IFinalGradeRepository } from '../../ports/final-grade.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface GetFinalGradeInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

export interface FinalGradeResult {
  id: string;
  internshipId: string;
  employerScore: number;
  academicScore: number;
  finalScore: number;
  letterGrade: string;
  calculatedAt: string;
}

@Injectable()
export class GetFinalGradeUseCase {
  constructor(
    private readonly finalGradeRepository: IFinalGradeRepository,
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(input: GetFinalGradeInput): Promise<FinalGradeResult> {
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
          'Only owner can view final grade',
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
        'Admin cannot view final grade',
        403,
      );
    }

    const grade = await this.finalGradeRepository.findByInternship(
      input.internshipId,
    );
    if (!grade) {
      throw new DomainException('NOT_FOUND', 'Final grade not found', 404);
    }

    return {
      id: grade.id,
      internshipId: grade.internshipId,
      employerScore: grade.employerScore,
      academicScore: grade.academicScore,
      finalScore: grade.finalScore,
      letterGrade: grade.letterGrade,
      calculatedAt: grade.calculatedAt.toISOString(),
    };
  }
}
