import { BadRequestException } from '@nestjs/common';

export const createUploadOptions = (
  allowedMimeTypes: string[],
  maxBytes = 5 * 1024 * 1024,
) => ({
  limits: { fileSize: maxBytes },
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    callback: (error: Error | null, acceptFile?: boolean) => void,
  ) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new BadRequestException('Unsupported file type') as unknown as Error, false);
      return;
    }
    callback(null, true);
  },
});

export const documentUploadOptions = createUploadOptions([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
export const pdfUploadOptions = createUploadOptions(['application/pdf']);
export const imageUploadOptions = createUploadOptions(
  ['image/jpeg', 'image/png'],
  2 * 1024 * 1024,
);
