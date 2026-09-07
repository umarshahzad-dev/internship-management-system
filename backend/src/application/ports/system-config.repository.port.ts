export interface SystemConfigData {
  key: string;
  value: string;
  description: string;
  isPublic: boolean;
  updatedAt: Date;
}

export abstract class ISystemConfigRepository {
  abstract findByKey(key: string): Promise<string | null>;
  abstract findAll(includePrivate?: boolean): Promise<SystemConfigData[]>;
  abstract upsert(
    key: string,
    value: string,
    description: string,
    isPublic: boolean,
  ): Promise<void>;
}
