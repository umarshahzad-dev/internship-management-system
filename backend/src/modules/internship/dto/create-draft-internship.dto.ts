import { IsDateString, IsUUID } from 'class-validator';

export class CreateDraftInternshipDto {
  @IsUUID()
  companyId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
