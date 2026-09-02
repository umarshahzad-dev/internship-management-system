import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ValidateEmployerTokenUseCase } from '../../application/use-cases/employer-evaluation/validate-employer-token.use-case';
import { SubmitDigitalEvaluationUseCase } from '../../application/use-cases/employer-evaluation/submit-digital-evaluation.use-case';
import { SubmitDigitalEvaluationDto } from './dto/submit-digital-evaluation.dto';
import { DomainException } from '../../common/exceptions/domain.exception';

@Controller('employer-evaluation')
export class PublicEmployerEvaluationController {
  constructor(
    private readonly validateEmployerTokenUseCase: ValidateEmployerTokenUseCase,
    private readonly submitDigitalEvaluationUseCase: SubmitDigitalEvaluationUseCase,
  ) {}

  @Get('validate')
  async validate(@Query('token') token: string) {
    if (!token) {
      throw new DomainException('VALIDATION_ERROR', 'Token is required', 400);
    }
    return this.validateEmployerTokenUseCase.execute({ plainToken: token });
  }

  @Post('submit')
  async submit(@Body() dto: SubmitDigitalEvaluationDto) {
    return this.submitDigitalEvaluationUseCase.execute({
      plainToken: dto.token,
      employerName: dto.employerName,
      grades: dto.grades,
      comments: dto.comments ?? null,
    });
  }
}
