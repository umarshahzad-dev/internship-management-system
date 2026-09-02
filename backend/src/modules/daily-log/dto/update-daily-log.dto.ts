import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDailyLogDto {
  @IsOptional()
  @IsDateString()
  logDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  content?: string;
}
