export abstract class IConfigProvider {
  abstract get<T>(key: string, defaultValue?: T): Promise<T>;
  abstract getOrThrow<T>(key: string): Promise<T>;
}
