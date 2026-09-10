import { Injectable } from '@nestjs/common';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';
import { SgkTracking } from '../../../domain/entities/sgk-tracking.entity';

export interface SgkRecordListItem {
  id: string;
  internshipId: string;
  status: SgkStatus;
  documentPath: string | null;
  studentName?: string;
  studentNumber?: string | null;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  internshipStatus?: string;
}

@Injectable()
export class ListSgkRecordsUseCase {
  constructor(private readonly sgkTrackingRepository: ISgkTrackingRepository) {}

  async execute(academicDepartmentId: string): Promise<SgkRecordListItem[]> {
    const projections: Array<{
      record: SgkTracking;
      studentName?: string;
      studentNumber?: string | null;
      companyName?: string;
      startDate?: string;
      endDate?: string;
      internshipStatus?: string;
    }> = this.sgkTrackingRepository.findAllByDepartmentWithProjection
      ? await this.sgkTrackingRepository.findAllByDepartmentWithProjection(academicDepartmentId)
      : (await this.sgkTrackingRepository.findAllByDepartment(academicDepartmentId)).map((record) => ({ record }));
    return projections.map(({ record, studentName, studentNumber, companyName, startDate, endDate, internshipStatus }) => ({
      id: record.id,
      internshipId: record.internshipId,
      status: record.status,
      documentPath: record.documentPath,
      studentName,
      studentNumber,
      companyName,
      startDate,
      endDate,
      internshipStatus,
    }));
  }
}
