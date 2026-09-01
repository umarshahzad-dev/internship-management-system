import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class FindOrCreateCompanyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Tax number must be 10 digits' })
  taxNumber: string;
}
