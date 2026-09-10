import { Injectable, Optional } from '@nestjs/common';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';

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
  employerApprovalIp: string | null;
  employerApprovalTimestamp: string | null;
  commissionApprovalUserId: string | null;
  commissionApprovalTimestamp: string | null;
  employerLogsApprovedAt: string | null;
  studentName?: string;
  studentNumber?: string | null;
  companyName?: string;
}

@Injectable()
export class ListInternshipsUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    @Optional() private readonly userRepository?: IUserRepository,
    @Optional() private readonly companyRepository?: ICompanyRepository,
  ) {}

  async execute(input: ListInternshipsInput): Promise<InternshipListItem[]> {
    let internships;
    let projections: Array<{ internship: any; studentName: string; studentNumber: string | null; companyName: string }> | undefined;
    if (input.role === 'STUDENT') {
      projections = this.internshipRepository.findAllWithProjection
        ? await this.internshipRepository.findAllWithProjection({ studentId: input.userId })
        : undefined;
      if (!projections) internships = await this.internshipRepository.findAllByStudent(input.userId);
      else
      internships = projections.map((item) => item.internship);
    } else if (input.role === 'ACADEMIC') {
      if (!input.departmentId) {
        throw new Error('Department ID is required for non-student list');
      }
      projections = this.internshipRepository.findAllWithProjection
        ? await this.internshipRepository.findAllWithProjection({ departmentId: input.departmentId })
        : undefined;
      if (!projections) internships = await this.internshipRepository.findAllByDepartment(input.departmentId);
      else internships = projections.map((item) => item.internship);
    } else {
      throw new DomainException('FORBIDDEN', 'Insufficient permissions', 403);
    }

    return Promise.all(internships.map(async (internship) => {
      const projection = projections?.find((item) => item.internship.id === internship.id);
      const [student, company] = projection ? [null, null] : await Promise.all([
        this.userRepository?.findById(internship.studentId),
        this.companyRepository?.findById(internship.companyId),
      ]);
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
      employerApprovalIp: internship.employerApprovalIp,
      employerApprovalTimestamp: internship.employerApprovalTimestamp
        ? internship.employerApprovalTimestamp.toISOString()
        : null,
      commissionApprovalUserId: internship.commissionApprovalUserId,
      commissionApprovalTimestamp: internship.commissionApprovalTimestamp
        ? internship.commissionApprovalTimestamp.toISOString()
        : null,
      employerLogsApprovedAt: internship.employerLogsApprovedAt
        ? internship.employerLogsApprovedAt.toISOString()
        : null,
        studentName: projection?.studentName ?? (student ? `${student.firstName} ${student.lastName}`.trim() : undefined),
        studentNumber: projection?.studentNumber ?? student?.studentNumber,
        companyName: projection?.companyName ?? company?.name,
      };
    }));
  }
}
