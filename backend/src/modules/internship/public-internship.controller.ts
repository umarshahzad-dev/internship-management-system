import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployerApproveApplicationUseCase } from '../../application/use-cases/internship/employer-approve-application.use-case';
import { VerifyInternshipSignatureUseCase } from '../../application/use-cases/internship/verify-internship-signature.use-case';

@Controller('public/internship')
export class PublicInternshipController {
  constructor(
    private readonly employerApproveApplicationUseCase: EmployerApproveApplicationUseCase,
    private readonly verifyInternshipSignatureUseCase: VerifyInternshipSignatureUseCase,
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

  @Get(':id/verify')
  async verifySignature(@Param('id', ParseUUIDPipe) id: string) {
    return this.verifyInternshipSignatureUseCase.execute(id);
  }
}
