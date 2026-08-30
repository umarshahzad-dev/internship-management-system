import { Injectable } from '@nestjs/common';
import { IDateProvider } from '../../application/ports/date-provider.port';

@Injectable()
export class SystemDateProvider implements IDateProvider {
  now(): Date {
    return new Date();
  }
}
