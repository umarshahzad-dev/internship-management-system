import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface VerifyZorunluStajBelgesiResult {
  studentId: string;
  studentName: string;
  studentNumber: string | null;
  departmentId: string | null;
  isValid: true;
}

@Injectable()
export class VerifyZorunluStajBelgesiUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(studentId: string): Promise<VerifyZorunluStajBelgesiResult> {
    const student = await this.userRepository.findById(studentId);
    if (!student || student.role.getValue() !== 'STUDENT') {
      throw new DomainException('NOT_FOUND', 'Student record not found', 404);
    }

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentNumber: student.studentNumber,
      departmentId: student.departmentId,
      isValid: true,
    };
  }
}
