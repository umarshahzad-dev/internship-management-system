import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ValidateEmployerTokenUseCase } from '../../application/use-cases/employer-evaluation/validate-employer-token.use-case';
import { SubmitDigitalEvaluationUseCase } from '../../application/use-cases/employer-evaluation/submit-digital-evaluation.use-case';
import { SubmitDigitalEvaluationDto } from './dto/submit-digital-evaluation.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { GetEmployerEvaluationDailyLogsUseCase } from '../../application/use-cases/employer-evaluation/get-employer-evaluation-daily-logs.use-case';

@Controller('employer-evaluation')
export class PublicEmployerEvaluationController {
  constructor(
    private readonly validateEmployerTokenUseCase: ValidateEmployerTokenUseCase,
    private readonly submitDigitalEvaluationUseCase: SubmitDigitalEvaluationUseCase,
    private readonly getEmployerEvaluationDailyLogsUseCase: GetEmployerEvaluationDailyLogsUseCase,
  ) {}

  @Get('validate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async validate(@Query('token') token: string) {
    if (!token) {
      throw new DomainException('VALIDATION_ERROR', 'Token is required', 400);
    }
    return this.validateEmployerTokenUseCase.execute({ plainToken: token });
  }

  @Get('daily-logs')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async dailyLogs(@Query('token') token: string) {
    if (!token) {
      throw new DomainException('VALIDATION_ERROR', 'Token is required', 400);
    }
    return this.getEmployerEvaluationDailyLogsUseCase.execute(token);
  }

  @Post('submit')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async submit(@Body() dto: SubmitDigitalEvaluationDto) {
    return this.submitDigitalEvaluationUseCase.execute({
      plainToken: dto.token,
      employerName: dto.employerName,
      grades: dto.grades,
      comments: dto.comments ?? null,
    });
  }
}
