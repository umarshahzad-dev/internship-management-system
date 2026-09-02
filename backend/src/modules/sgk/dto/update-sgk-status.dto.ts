import { IsEnum } from 'class-validator';
import { SgkStatus } from '../../../domain/enums/sgk-status.enum';

export class UpdateSgkStatusDto {
  @IsEnum(SgkStatus)
  status: SgkStatus;
}
