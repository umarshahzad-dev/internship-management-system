import { Injectable } from '@nestjs/common';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface ListInternshipsInput {
  role: string;
  userId: string;
  departmentId?: string | null;
}

export interface InternshipListItem {
  id: string;
  departmentId: string;
  studentId: string;
  companyId: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  locked: boolean;
  approvedAt: string | null;
}

@Injectable()
export class ListInternshipsUseCase {
  constructor(private readonly internshipRepository: IInternshipRepository) {}

  async execute(input: ListInternshipsInput): Promise<InternshipListItem[]> {
    let internships;
    if (input.role === 'STUDENT') {
      internships = await this.internshipRepository.findAllByStudent(
        input.userId,
      );
    } else {
      if (!input.departmentId) {
        throw new Error('Department ID is required for non-student list');
      }
      internships = await this.internshipRepository.findAllByDepartment(
        input.departmentId,
      );
    }

    return internships.map((internship) => ({
      id: internship.id,
      departmentId: internship.departmentId,
      studentId: internship.studentId,
      companyId: internship.companyId,
      status: internship.status,
      startDate: internship.startDate.toISOString().slice(0, 10),
      endDate: internship.endDate.toISOString().slice(0, 10),
      locked: internship.locked,
      approvedAt: internship.approvedAt
        ? internship.approvedAt.toISOString()
        : null,
    }));
  }
}
