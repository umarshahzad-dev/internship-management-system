import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCalendarDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  termName?: string;

  @IsOptional()
  @IsDateString()
  applicationStart?: string;

  @IsOptional()
  @IsDateString()
  applicationEnd?: string;

  @IsOptional()
  @IsDateString()
  internshipStart?: string;

  @IsOptional()
  @IsDateString()
  internshipEnd?: string;
}
