import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { documentUploadOptions, imageUploadOptions } from '../../common/files/upload-options';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { ImportUsersUseCase } from '../../application/use-cases/user/import-users.use-case';
import { UploadProfilePhotoUseCase } from '../../application/use-cases/user/upload-profile-photo.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { DomainException } from '../../common/exceptions/domain.exception';
import { paginate } from '../../common/pagination/paginate';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly importUsersUseCase: ImportUsersUseCase,
    private readonly uploadProfilePhotoUseCase: UploadProfilePhotoUseCase, // <-- added
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return paginate(await this.listUsersUseCase.execute(), page, pageSize);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      studentNumber: dto.studentNumber,
      departmentId: dto.departmentId,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    }
    return this.importUsersUseCase.execute(file.buffer);
  }

  @Get('me/photo')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getPhoto(@Req() req: AuthenticatedRequest) {
    const user = await this.getUserUseCase.execute({
      userId: req.user!.id,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
    });
    return { profilePhotoPath: user.profilePhotoPath };
  }

  @Patch('me')
  @UseGuards(CsrfGuard)
  async updateOwnProfile(
    @Body() dto: UpdateOwnProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.updateUserUseCase.execute({
      userId: req.user!.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  @Post('me/photo')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new DomainException('VALIDATION_ERROR', 'File is required', 400);
    }
    return this.uploadProfilePhotoUseCase.execute(req.user!.id, file);
  }

  @Get(':id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getUserUseCase.execute({
      userId: id,
      currentUserId: req.user!.id,
      currentUserRole: req.user!.role,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, CsrfGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute({
      userId: id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      isActive: dto.isActive,
      studentNumber: dto.studentNumber,
      departmentId: dto.departmentId,
    });
  }
}
