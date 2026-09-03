import { IsNumber, Max, Min } from 'class-validator';

export class EnterAcademicScoreDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  logQuality: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  reportQuality: number;
}
