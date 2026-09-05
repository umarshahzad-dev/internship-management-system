import { IsBoolean, IsDateString } from 'class-validator';

export class CalculateWorkingDaysDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  includeSaturdays: boolean;
}
