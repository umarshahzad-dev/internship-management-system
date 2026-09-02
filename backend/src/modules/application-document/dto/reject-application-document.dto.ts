import { IsString, MinLength } from 'class-validator';

export class RejectApplicationDocumentDto {
  @IsString()
  @MinLength(1)
  reason: string;
}
