import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateHolidayDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @IsOptional()
  @IsDateString()
  holidayDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;
}
