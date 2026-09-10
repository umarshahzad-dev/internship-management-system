import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { AnnouncementDto } from './dto/announcement.dto';
import { CreateAnnouncementUseCase } from '../../application/use-cases/announcement/create-announcement.use-case';
import { UpdateAnnouncementUseCase } from '../../application/use-cases/announcement/update-announcement.use-case';
import { DeleteAnnouncementUseCase } from '../../application/use-cases/announcement/delete-announcement.use-case';
import { ListAnnouncementsForAdminUseCase } from '../../application/use-cases/announcement/list-announcements-for-admin.use-case';
import { ListAnnouncementsForUserUseCase } from '../../application/use-cases/announcement/list-announcements-for-user.use-case';

@Controller('announcements')
@UseGuards(AuthGuard, RolesGuard)
export class AnnouncementController {
  constructor(private readonly createUseCase: CreateAnnouncementUseCase, private readonly updateUseCase: UpdateAnnouncementUseCase, private readonly deleteUseCase: DeleteAnnouncementUseCase, private readonly adminListUseCase: ListAnnouncementsForAdminUseCase, private readonly userListUseCase: ListAnnouncementsForUserUseCase) {}
  @Get() @Roles(UserRole.STUDENT, UserRole.ACADEMIC, UserRole.ADMINISTRATIVE, UserRole.ADMIN) list(@Req() req: AuthenticatedRequest) { return this.userListUseCase.execute(req.user!.role as UserRole, req.user!.departmentId ?? null); }
  @Get('admin') @Roles(UserRole.ADMIN) adminList() { return this.adminListUseCase.execute(); }
  @Post() @Roles(UserRole.ADMIN) @UseGuards(CsrfGuard) create(@Body() dto: AnnouncementDto) { return this.createUseCase.execute({ ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }); }
  @Patch(':id') @Roles(UserRole.ADMIN) @UseGuards(CsrfGuard) update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AnnouncementDto) { return this.updateUseCase.execute(id, { ...dto, expiresAt: dto.expiresAt === null ? null : dto.expiresAt ? new Date(dto.expiresAt) : undefined }); }
  @Delete(':id') @Roles(UserRole.ADMIN) @UseGuards(CsrfGuard) async remove(@Param('id', new ParseUUIDPipe()) id: string) { await this.deleteUseCase.execute(id); return { message: 'Announcement deleted' }; }
}
