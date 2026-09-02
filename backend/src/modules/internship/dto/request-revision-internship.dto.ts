import { IsString, MinLength } from 'class-validator';

export class RequestRevisionInternshipDto {
  @IsString()
  @MinLength(1)
  reason: string;
}
