export interface IConfigProvider {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  getOrThrow<T>(key: string): Promise<T>;
}
