import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateDraftInternshipDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
