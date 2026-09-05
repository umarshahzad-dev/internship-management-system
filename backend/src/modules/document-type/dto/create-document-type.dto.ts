import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DocumentSource } from '../../../domain/enums/document-source.enum';

export class CreateDocumentTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsNotEmpty()
  @IsEnum(DocumentSource)
  source: DocumentSource;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSize?: number;
}
