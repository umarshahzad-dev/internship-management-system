import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileStorage } from '../../application/ports/file-storage.port';

@Injectable()
export class LocalFileStorageService extends IFileStorage {
  private readonly logger = new Logger(LocalFileStorageService.name);
  private readonly baseDir = process.env.UPLOAD_DIR || './uploads';

  async save(
    file: Buffer,
    directory: string,
    filename: string,
  ): Promise<string> {
    const dirPath = path.join(this.baseDir, directory);
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, file);
    this.logger.log(`Saved file to ${filePath}`);
    return filePath;
  }

  async get(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${filePath}: ${error}`);
    }
  }
}
