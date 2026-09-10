import { DomainException } from '../exceptions/domain.exception';

export function assertMimeType(file: Express.Multer.File, allowed: string[]): void {
  if (!allowed.includes(file.mimetype)) {
    throw new DomainException('FILE_TYPE_NOT_ALLOWED', 'Unsupported file type', 400);
  }
}
