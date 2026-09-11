import {
  IsDateString,
  IsString,
  
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCalendarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  termName: string;

  @IsDateString()
  applicationStart: string;

  @IsDateString()
  applicationEnd: string;

  @IsDateString()
  internshipStart: string;

  @IsDateString()
  internshipEnd: string;
}
