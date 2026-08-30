import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, AuthenticatedRequest } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { GetMeUseCase } from '../../application/use-cases/auth/get-me.use-case';
import { PasswordResetRequestUseCase } from '../../application/use-cases/auth/password-reset-request.use-case';
import { PasswordResetConfirmUseCase } from '../../application/use-cases/auth/password-reset-confirm.use-case';
import { IConfigProvider } from '../../application/ports/config-provider.port';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly passwordResetRequestUseCase: PasswordResetRequestUseCase,
    private readonly passwordResetConfirmUseCase: PasswordResetConfirmUseCase,
    private readonly config: IConfigProvider,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isBrowser = !req.headers.authorization;
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
      isBrowser,
    });

    if (isBrowser && result.sessionId) {
      const isProduction =
        (await this.config.get<string>('NODE_ENV')) === 'production';
      res.cookie('imas_session', result.sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    const { sessionId, ...responseBody } = result;
    return responseBody;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
    });
  }

  @UseGuards(AuthGuard, CsrfGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user!;
    const session = req.session!;
    await this.logoutUseCase.execute({
      userId: user.id,
      sessionId: session.id,
    });
    res.clearCookie('imas_session');
    return { message: 'Logged out' };
  }

  @UseGuards(AuthGuard)
  @Get('csrf')
  async getCsrf(@Req() req: AuthenticatedRequest) {
    return { csrfToken: req.session!.csrfToken };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  async passwordResetRequest(@Body() dto: PasswordResetRequestDto) {
    await this.passwordResetRequestUseCase.execute({ email: dto.email });
    return { message: 'If email exists, reset link sent.' };
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async passwordResetConfirm(@Body() dto: PasswordResetConfirmDto) {
    await this.passwordResetConfirmUseCase.execute({
      token: dto.token,
      newPassword: dto.newPassword,
    });
    return { message: 'Password updated.' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.getMeUseCase.execute({ userId: user.id });
  }
}
