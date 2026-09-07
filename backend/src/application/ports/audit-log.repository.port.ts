export interface CreateAuditLogDto {
  userId: string | null;
  userRole: string | null;
  method: string;
  path: string;
  payload: any;
  ipAddress: string;
  statusCode: number;
}

export abstract class IAuditLogRepository {
  abstract createLog(logData: CreateAuditLogDto): Promise<void>;
}
