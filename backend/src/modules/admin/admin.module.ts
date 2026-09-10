import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportModule } from '../report/report.module';
import { RolesGuard } from '../user/guards/roles.guard';
import { AdminController } from './admin.controller';
import { GetAdminDashboardSummaryUseCase } from '../../application/use-cases/admin/get-admin-dashboard-summary.use-case';
@Module({ imports: [AuthModule, ReportModule], controllers: [AdminController], providers: [GetAdminDashboardSummaryUseCase, RolesGuard] })
export class AdminModule {}
