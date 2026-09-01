import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateHolidayDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @IsDateString()
  holidayDate: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;
}
