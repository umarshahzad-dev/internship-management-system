import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfigProvider } from '../../application/ports/config-provider.port';

@Injectable()
export class EnvConfigProvider implements IConfigProvider {
  constructor(private readonly configService: ConfigService) {}

  async get<T>(key: string, defaultValue?: T): Promise<T> {
    const value = this.configService.get<T>(key);
    if (value === undefined || value === null) {
      return defaultValue as T;
    }
    return value;
  }

  async getOrThrow<T>(key: string): Promise<T> {
    const value = await this.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Configuration key "${key}" not found`);
    }
    return value;
  }
}

