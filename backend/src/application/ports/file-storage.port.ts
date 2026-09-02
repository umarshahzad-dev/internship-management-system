export abstract class IFileStorage {
  abstract save(
    file: Buffer,
    directory: string,
    filename: string,
  ): Promise<string>;
  abstract get(filePath: string): Promise<Buffer>;
  abstract delete(filePath: string): Promise<void>;
}
