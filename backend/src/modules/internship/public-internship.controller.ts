import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { EmployerApproveApplicationUseCase } from '../../application/use-cases/internship/employer-approve-application.use-case';

@Controller('public/internship')
export class PublicInternshipController {
  constructor(
    private readonly employerApproveApplicationUseCase: EmployerApproveApplicationUseCase,
  ) {}

  @Post('employer-approve')
  async approve(
    @Body() body: { token: string; sgkNumber?: string; iban?: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    await this.employerApproveApplicationUseCase.execute({
      token: body.token,
      ipAddress,
      sgkNumber: body.sgkNumber,
      iban: body.iban,
    });
    return { success: true };
  }
}
