import { Internship } from '../../domain/entities/internship.entity';
import { InternshipEntity } from '../database/entities/internship.entity';

export class InternshipMapper {
  static toDomain(entity: InternshipEntity): Internship {
    return new Internship(
      entity.id,
      entity.departmentId,
      entity.studentId,
      entity.companyId,
      entity.status,
      new Date(entity.startDate),
      new Date(entity.endDate),
      entity.gradingData,
      entity.locked,
      entity.approvedAt,
      entity.approvedBy,
      entity.createdAt,
      entity.updatedAt,
      entity.employerApprovalIp,
      entity.employerApprovalTimestamp,
      entity.commissionApprovalUserId,
      entity.commissionApprovalTimestamp,
    );
  }

  static toPersistence(domain: Internship): InternshipEntity {
    const entity = new InternshipEntity();
    entity.id = domain.id;
    entity.departmentId = domain.departmentId;
    entity.studentId = domain.studentId;
    entity.companyId = domain.companyId;
    entity.status = domain.status;
    entity.startDate = domain.startDate;
    entity.endDate = domain.endDate;
    entity.gradingData = domain.gradingData;
    entity.locked = domain.locked;
    entity.approvedAt = domain.approvedAt;
    entity.approvedBy = domain.approvedBy;
    entity.employerApprovalIp = domain.employerApprovalIp;
    entity.employerApprovalTimestamp = domain.employerApprovalTimestamp;
    entity.commissionApprovalUserId = domain.commissionApprovalUserId;
    entity.commissionApprovalTimestamp = domain.commissionApprovalTimestamp;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
