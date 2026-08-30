export interface JwtPayload {
  sub: string;
  sessionId: string;
  departmentId: string | null;
  role: string;
}

export abstract class IJwtService {
  abstract signAccessToken(payload: JwtPayload): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<JwtPayload | null>;
}
