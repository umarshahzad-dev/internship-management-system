import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { GetAdminDashboardSummaryUseCase } from '../../application/use-cases/admin/get-admin-dashboard-summary.use-case';
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly summary: GetAdminDashboardSummaryUseCase) {}
  @Get('dashboard-summary') @Roles(UserRole.ADMIN) dashboardSummary(@Req() req: AuthenticatedRequest) { return this.summary.execute(req.user!.role); }
}
