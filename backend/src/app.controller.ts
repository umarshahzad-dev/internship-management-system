import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('db-health')
  async getDatabaseHealth(): Promise<{ status: string; dbTime: string }> {
    return this.appService.getDatabaseHealth();
  }
}
