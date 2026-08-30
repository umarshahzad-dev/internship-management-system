import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth(): Promise<{ status: string; dbTime: string }> {
    try {
      const result = await this.dataSource.query('SELECT NOW() as now');
      return {
        status: 'ok',
        dbTime: result[0].now,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      return {
        status: 'error',
        dbTime: message,
      };
    }
  }
}
