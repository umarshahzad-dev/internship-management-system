import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../../../domain/value-objects/role.vo';
export class AnnouncementDto {
  @IsString() @MinLength(2) title: string;
  @IsString() @MinLength(2) content: string;
  @IsArray() @IsEnum(UserRole, { each: true }) targetRoles: UserRole[];
  @IsOptional() @IsUUID() departmentId?: string | null;
  @IsOptional() @IsDateString() expiresAt?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
