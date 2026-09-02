import { IsString, MinLength } from 'class-validator';

export class RejectInternshipDto {
  @IsString()
  @MinLength(1)
  reason: string;
}
