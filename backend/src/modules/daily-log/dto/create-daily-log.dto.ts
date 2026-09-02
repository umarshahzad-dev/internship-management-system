import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateDailyLogDto {
  @IsDateString()
  logDate: string;

  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  content: string;
}
