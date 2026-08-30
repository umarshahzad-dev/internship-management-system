import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import { ITokenGenerator } from '../../application/ports/token-generator.port';

@Injectable()
export class CryptoTokenGeneratorService implements ITokenGenerator {
  generateRandomToken(bytes: number = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  generateCsrfToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateSessionId(): string {
    return randomUUID();
  }
}
