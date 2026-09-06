import { Injectable } from '@nestjs/common';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { IUserRepository } from '../../ports/user.repository.port';
import { ICompanyRepository } from '../../ports/company.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InternshipStatus } from '../../../domain/enums/internship-status.enum';

export interface VerifySignatureResult {
  internshipId: string;
  studentName: string;
  studentNumber: string | null;
  companyName: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  employerApprovalIp: string | null;
  employerApprovalTimestamp: string | null;
  commissionApprovalTimestamp: string | null;
  isValid: boolean;
}

@Injectable()
export class VerifyInternshipSignatureUseCase {
  constructor(
    private readonly internshipRepository: IInternshipRepository,
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(internshipId: string): Promise<VerifySignatureResult> {
    const internship = await this.internshipRepository.findById(internshipId);
    if (!internship)
      throw new DomainException(
        'NOT_FOUND',
        'Internship record not found',
        404,
      );

    const [student, company] = await Promise.all([
      this.userRepository.findById(internship.studentId),
      this.companyRepository.findById(internship.companyId),
    ]);

    if (!student || !company)
      throw new DomainException(
        'INTERNAL_ERROR',
        'Data integrity failure',
        500,
      );

    const isApproved = [
      InternshipStatus.APPROVED,
      InternshipStatus.APPROVED_PENDING_SGK,
      InternshipStatus.ONGOING,
      InternshipStatus.EVALUATION,
      InternshipStatus.GRADED,
      InternshipStatus.COMPLETED,
    ].includes(internship.status);

    return {
      internshipId: internship.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentNumber: student.studentNumber,
      companyName: company.name,
      status: internship.status,
      startDate: internship.startDate.toISOString().slice(0, 10),
      endDate: internship.endDate.toISOString().slice(0, 10),
      employerApprovalIp: internship.employerApprovalIp,
      employerApprovalTimestamp: internship.employerApprovalTimestamp
        ? internship.employerApprovalTimestamp.toISOString()
        : null,
      commissionApprovalTimestamp: internship.commissionApprovalTimestamp
        ? internship.commissionApprovalTimestamp.toISOString()
        : null,
      isValid: isApproved,
    };
  }
}
