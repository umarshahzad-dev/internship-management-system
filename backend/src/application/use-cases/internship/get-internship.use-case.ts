import { Injectable } from '@nestjs/common';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface GetInternshipInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

export interface InternshipDetail {
  id: string;
  departmentId: string;
  studentId: string;
  companyId: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  locked: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  employerApprovalIp: string | null;
  employerApprovalTimestamp: string | null;
  commissionApprovalUserId: string | null;
  commissionApprovalTimestamp: string | null;
}

@Injectable()
export class GetInternshipUseCase {
  constructor(private readonly internshipRepository: IInternshipRepository) {}

  async execute(input: GetInternshipInput): Promise<InternshipDetail> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (input.currentUserRole === 'STUDENT') {
      if (internship.studentId !== input.currentUserId) {
        throw new DomainException('FORBIDDEN', 'Insufficient permissions', 403);
      }
    } else if (input.currentUserRole === 'ACADEMIC') {
      if (
        !input.currentUserDepartmentId ||
        internship.departmentId !== input.currentUserDepartmentId
      ) {
        throw new DomainException('FORBIDDEN', 'Insufficient permissions', 403);
      }
    }
    // Admin can view any

    return {
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
      approvedBy: internship.approvedBy,
      employerApprovalIp: internship.employerApprovalIp,
      employerApprovalTimestamp: internship.employerApprovalTimestamp
        ? internship.employerApprovalTimestamp.toISOString()
        : null,
      commissionApprovalUserId: internship.commissionApprovalUserId,
      commissionApprovalTimestamp: internship.commissionApprovalTimestamp
        ? internship.commissionApprovalTimestamp.toISOString()
        : null,
    };
  }
}
