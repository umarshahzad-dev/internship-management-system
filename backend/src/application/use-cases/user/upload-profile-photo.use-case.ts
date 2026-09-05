import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { IUserRepository } from '../../ports/user.repository.port';
import { IFileStorage } from '../../ports/file-storage.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class UploadProfilePhotoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async execute(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ profilePhotoPath: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('NOT_FOUND', 'User not found', 404);
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      throw new DomainException(
        'FILE_TYPE_NOT_ALLOWED',
        'Only JPG and PNG are allowed',
        415,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const savedPath = await this.fileStorage.save(
      file.buffer,
      'profile-photos',
      filename,
    );

    user.updateProfilePhoto(savedPath);
    await this.userRepository.update(user);

    return { profilePhotoPath: savedPath };
  }
}
