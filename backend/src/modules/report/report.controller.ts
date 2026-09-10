import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { GenerateInternshipCsvUseCase } from '../../application/use-cases/report/generate-internship-csv.use-case';
import { GetInternshipSummaryUseCase } from '../../application/use-cases/report/get-internship-summary.use-case';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportController {
  constructor(
    private readonly generateCsvUseCase: GenerateInternshipCsvUseCase,
    private readonly getSummaryUseCase: GetInternshipSummaryUseCase,
  ) {}

  @Get('summary')
  @Roles(UserRole.ADMIN)
  async summary(@Req() req: AuthenticatedRequest) {
    return this.getSummaryUseCase.execute(req.user!.role);
  }

  @Get('internships/csv')
  @Roles(UserRole.ADMIN)
  async downloadInternshipCsv(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const csvString = await this.generateCsvUseCase.execute(req.user!.role, {
      status,
      departmentId,
    });
    const timestamp = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="staj_raporu_${timestamp}.csv"`,
    );
    res.send(csvString);
  }
}
