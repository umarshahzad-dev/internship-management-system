import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtService,
  JwtPayload,
} from '../../application/ports/jwt.service.port';
import { IConfigProvider } from '../../application/ports/config-provider.port';

@Injectable()
export class JwtServiceAdapter extends IJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: IConfigProvider,
  ) {
    super();
  }

  private async getSecret(): Promise<string> {
    const secret = await this.config.get<string>('JWT_SECRET');
    if (secret) return secret;
    if (process.env.NODE_ENV !== 'production') {
      return 'dev_secret_change_me';
    }
    throw new Error('JWT_SECRET must be set in production');
  }

  async signAccessToken(payload: JwtPayload): Promise<string> {
    const secret = await this.getSecret();
    const expiresIn = await this.config.get<number>(
      'auth.access_token_lifetime_seconds',
      15 * 60,
    );
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const secret = await this.getSecret();
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch {
      return null;
    }
  }
}
