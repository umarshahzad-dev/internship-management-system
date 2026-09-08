import { Injectable } from '@nestjs/common';
import { IDailyLogRepository } from '../../ports/daily-log.repository.port';
import { ValidateEmployerTokenUseCase } from './validate-employer-token.use-case';

export interface EmployerDailyLogItem {
  logDate: string;
  content: string;
}

@Injectable()
export class GetEmployerEvaluationDailyLogsUseCase {
  constructor(
    private readonly validateEmployerTokenUseCase: ValidateEmployerTokenUseCase,
    private readonly dailyLogRepository: IDailyLogRepository,
  ) {}

  async execute(plainToken: string): Promise<EmployerDailyLogItem[]> {
    const tokenContext = await this.validateEmployerTokenUseCase.execute({
      plainToken,
    });
    const logs = await this.dailyLogRepository.findByInternship(
      tokenContext.internshipId,
    );

    return logs.map((log) => ({
      logDate: log.logDate.toISOString().slice(0, 10),
      content: log.content,
    }));
  }
}
