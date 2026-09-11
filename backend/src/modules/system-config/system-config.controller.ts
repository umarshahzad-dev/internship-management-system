import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ManageSystemConfigUseCase } from '../../application/use-cases/system-config/manage-system-config.use-case';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../../domain/value-objects/role.vo';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ResolveConfigValueUseCase } from '../../application/use-cases/system-config/resolve-config-value.use-case';
import { paginate } from '../../common/pagination/paginate';

@Controller('system-configs')
export class SystemConfigController {
  constructor(private readonly manageUseCase: ManageSystemConfigUseCase, private readonly resolveUseCase: ResolveConfigValueUseCase) {}

  /** Returns global settings with effective department overrides for Admin users. */
  @Get('resolved')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolved(@Query('departmentId') departmentId?: string) { return this.resolveUseCase.execute(departmentId); }

  /** Creates or updates a department-specific setting override. */
  @Put('override')
  @UseGuards(AuthGuard, RolesGuard, CsrfGuard)
  @Roles(UserRole.ADMIN)
  async putOverride(@Body() body: { departmentId: string; key: string; value: string }) { return this.resolveUseCase.override(body.departmentId, body.key, body.value); }

  /** Removes a department-specific override and restores the global value. */
  @Delete('override')
  @UseGuards(AuthGuard, RolesGuard, CsrfGuard)
  @Roles(UserRole.ADMIN)
  async deleteOverride(@Query('departmentId') departmentId: string, @Query('key') key: string) { await this.resolveUseCase.remove(departmentId, key); return { success: true }; }

  @Get('public')
  async getPublicConfigs() {
    return this.manageUseCase.getAllConfigs();
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminConfigs(@Req() req: AuthenticatedRequest, @Query('search') search?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('sortBy') sortBy?: string, @Query('sortDir') sortDir?: string) {
    const configs = await this.manageUseCase.getAllConfigs(req.user!.role);
    const filtered = configs.filter((config) => !search || `${config.key} ${config.value} ${config.description}`.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')));
    const sorted = [...filtered].sort((a, b) => {
      const key = sortBy === 'value' ? 'value' : sortBy === 'description' ? 'description' : 'key';
      const result = String(a[key]).localeCompare(String(b[key]), 'tr-TR');
      return sortDir === 'desc' ? -result : result;
    });
    return paginate(sorted, page, pageSize);
  }

  @Patch(':key')
  @UseGuards(AuthGuard, RolesGuard, CsrfGuard)
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
