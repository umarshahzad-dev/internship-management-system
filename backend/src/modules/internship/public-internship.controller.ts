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
import { EmployerApproveApplicationDto } from './dto/employer-approve-application.dto';
import { VerifyZorunluStajBelgesiUseCase } from '../../application/use-cases/internship/verify-zorunlu-staj-belgesi.use-case';

@Controller('public/internship')
export class PublicInternshipController {
  constructor(
    private readonly employerApproveApplicationUseCase: EmployerApproveApplicationUseCase,
    private readonly verifyInternshipSignatureUseCase: VerifyInternshipSignatureUseCase,
    private readonly verifyZorunluStajBelgesiUseCase: VerifyZorunluStajBelgesiUseCase,
  ) {}

  @Post('employer-approve')
  async approve(
    @Body() body: EmployerApproveApplicationDto,
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

  @Get('student/:id/verify')
  async verifyMandatoryLetter(@Param('id', ParseUUIDPipe) id: string) {
    return this.verifyZorunluStajBelgesiUseCase.execute(id);
  }
}
