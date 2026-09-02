import { Injectable } from '@nestjs/common';
import { ISgkTrackingRepository } from '../../ports/sgk-tracking.repository.port';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

export interface SgkRecordListItem {
  id: string;
  internshipId: string;
  status: SgkStatus;
  documentPath: string | null;
}

@Injectable()
export class ListSgkRecordsUseCase {
  constructor(private readonly sgkTrackingRepository: ISgkTrackingRepository) {}

  async execute(academicDepartmentId: string): Promise<SgkRecordListItem[]> {
    const records =
      await this.sgkTrackingRepository.findAllByDepartment(
        academicDepartmentId,
      );
    return records.map((record) => ({
      id: record.id,
      internshipId: record.internshipId,
      status: record.status,
      documentPath: record.documentPath,
    }));
  }
}
