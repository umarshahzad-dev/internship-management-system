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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { ImportUsersUseCase } from '../../application/use-cases/user/import-users.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../domain/value-objects/role.vo';
import { CsrfGuard } from '../auth/guards/csrf.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly importUsersUseCase: ImportUsersUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async list() {
    return this.listUsersUseCase.execute();
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
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.importUsersUseCase.execute(file.buffer);
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
    });
  }
}
