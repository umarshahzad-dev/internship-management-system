import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class EmployerApproveApplicationDto {
  @IsString()
  @MinLength(1)
  token: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,50}$/, { message: 'SGK number must contain digits only' })
  sgkNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^TR\d{24}$/i, { message: 'IBAN must be a Turkish IBAN' })
  iban?: string;
}
