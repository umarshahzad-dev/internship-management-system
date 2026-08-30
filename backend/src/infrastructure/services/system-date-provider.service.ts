import { Injectable } from '@nestjs/common';
import { IDateProvider } from '../../application/ports/date-provider.port';

@Injectable()
export class SystemDateProvider extends IDateProvider {
  now(): Date {
    return new Date();
  }
}
