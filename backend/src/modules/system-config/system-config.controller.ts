import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ManageSystemConfigUseCase } from '../../application/use-cases/system-config/manage-system-config.use-case';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Controller('system-configs')
export class SystemConfigController {
  constructor(private readonly manageUseCase: ManageSystemConfigUseCase) {}

  @Get('public')
  async getPublicConfigs() {
    return this.manageUseCase.getAllConfigs();
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminConfigs(@Req() req: AuthenticatedRequest) {
    return this.manageUseCase.getAllConfigs(req.user!.role);
  }

  @Patch(':key')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateConfig(
    @Param('key') key: string,
    @Body() dto: UpdateSystemConfigDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.manageUseCase.updateConfig(key, dto.value, req.user!.role);
    return { success: true, key, value: dto.value };
  }
}
