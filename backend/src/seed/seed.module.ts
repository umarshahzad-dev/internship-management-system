import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { DepartmentEntity } from '../infrastructure/database/entities/department.entity';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserSecurityStateEntity } from '../infrastructure/database/entities/user-security-state.entity';
import { DocumentTypeEntity } from '../infrastructure/database/entities/document-type.entity';
import { SystemConfigEntity } from '../infrastructure/database/entities/system-config.entity';
import { CompanyEntity } from '../infrastructure/database/entities/company.entity';
import { AcademicCalendarEntity } from '../infrastructure/database/entities/academic-calendar.entity';
import { HolidayEntity } from '../infrastructure/database/entities/holiday.entity';
import { InternshipEntity } from '../infrastructure/database/entities/internship.entity';
import { ApplicationDocumentEntity } from '../infrastructure/database/entities/application-document.entity';
import { DailyLogEntity } from '../infrastructure/database/entities/daily-log.entity';
import { SgkTrackingEntity } from '../infrastructure/database/entities/sgk-tracking.entity';
import { EmployerEvaluationEntity } from '../infrastructure/database/entities/employer-evaluation.entity';
import { FinalGradeEntity } from '../infrastructure/database/entities/final-grade.entity';
import { EmployerTokenEntity } from '../infrastructure/database/entities/employer-token.entity';
import { AuditLogEntity } from '../infrastructure/database/entities/audit-log.entity';
import { NotificationOutboxEntity } from '../infrastructure/database/entities/notification-outbox.entity';
import { AnnouncementEntity } from '../infrastructure/database/entities/announcement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DepartmentEntity,
      UserEntity,
      UserSecurityStateEntity,
      DocumentTypeEntity,
      SystemConfigEntity,
      CompanyEntity,
      AcademicCalendarEntity,
      HolidayEntity,
      InternshipEntity,
      ApplicationDocumentEntity,
      DailyLogEntity,
      SgkTrackingEntity,
      EmployerEvaluationEntity,
      FinalGradeEntity,
      EmployerTokenEntity,
      AuditLogEntity,
      NotificationOutboxEntity,
      AnnouncementEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
