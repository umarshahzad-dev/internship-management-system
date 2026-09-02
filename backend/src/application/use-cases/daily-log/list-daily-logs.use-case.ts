import { Injectable } from '@nestjs/common';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { IInternshipRepository } from '../../ports/internship.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface ListDailyLogsInput {
  internshipId: string;
  currentUserId: string;
  currentUserRole: string;
  currentUserDepartmentId: string | null;
}

export interface DailyLogListItem {
  id: string;
  internshipId: string;
  logDate: string;
  content: string;
}

@Injectable()
export class ListDailyLogsUseCase {
  constructor(
    private readonly dailyLogRepository: IDailyLogRepository,
    private readonly internshipRepository: IInternshipRepository,
  ) {}

  async execute(input: ListDailyLogsInput): Promise<DailyLogListItem[]> {
    const internship = await this.internshipRepository.findById(
      input.internshipId,
    );
    if (!internship) {
      throw new DomainException('NOT_FOUND', 'Internship not found', 404);
    }

    if (input.currentUserRole === 'STUDENT') {
      if (internship.studentId !== input.currentUserId) {
        throw new DomainException('FORBIDDEN', 'Only owner can view logs', 403);
      }
    } else if (input.currentUserRole === 'ACADEMIC') {
      if (
        !input.currentUserDepartmentId ||
        internship.departmentId !== input.currentUserDepartmentId
      ) {
        throw new DomainException(
          'FORBIDDEN',
          'Academic cannot view logs of other departments',
          403,
        );
      }
    } else {
      // Admin access is removed per requirement
      throw new DomainException(
        'FORBIDDEN',
        'Admins cannot view daily logs',
        403,
      );
    }

    const logs = await this.dailyLogRepository.findByInternship(
      input.internshipId,
    );
    return logs.map((log) => ({
      id: log.id,
      internshipId: log.internshipId,
      logDate: log.logDate.toISOString().slice(0, 10),
      content: log.content,
    }));
  }
}
