import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../user/guards/roles.guard';
import { AnnouncementEntity } from '../../infrastructure/database/entities/announcement.entity';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementRepository } from '../../infrastructure/repositories/announcement.repository';
import { IAnnouncementRepository } from '../../application/ports/announcement.repository.port';
import { IDateProvider } from '../../application/ports/date-provider.port';
import { SystemDateProvider } from '../../infrastructure/services/system-date-provider.service';
import { CreateAnnouncementUseCase } from '../../application/use-cases/announcement/create-announcement.use-case';
import { UpdateAnnouncementUseCase } from '../../application/use-cases/announcement/update-announcement.use-case';
import { DeleteAnnouncementUseCase } from '../../application/use-cases/announcement/delete-announcement.use-case';
import { ListAnnouncementsForAdminUseCase } from '../../application/use-cases/announcement/list-announcements-for-admin.use-case';
import { ListAnnouncementsForUserUseCase } from '../../application/use-cases/announcement/list-announcements-for-user.use-case';
@Module({ imports: [AuthModule, TypeOrmModule.forFeature([AnnouncementEntity])], controllers: [AnnouncementController], providers: [{ provide: IAnnouncementRepository, useClass: AnnouncementRepository }, { provide: IDateProvider, useClass: SystemDateProvider }, RolesGuard, CreateAnnouncementUseCase, UpdateAnnouncementUseCase, DeleteAnnouncementUseCase, ListAnnouncementsForAdminUseCase, ListAnnouncementsForUserUseCase], exports: [IAnnouncementRepository] })
export class AnnouncementModule {}
