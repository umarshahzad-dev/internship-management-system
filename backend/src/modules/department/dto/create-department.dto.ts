import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  facultyName: string;
}
