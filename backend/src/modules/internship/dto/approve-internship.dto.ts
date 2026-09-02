import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveInternshipDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
