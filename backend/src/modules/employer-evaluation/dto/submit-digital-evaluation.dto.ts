import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitDigitalEvaluationDto {
  @IsString()
  @MinLength(1)
  token: string;

  @IsString()
  @MinLength(1)
  employerName: string;

  @IsObject()
  grades: Record<string, string>;

  @IsOptional()
  @IsString()
  comments?: string | null;
}
