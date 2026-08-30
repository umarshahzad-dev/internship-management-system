export interface JwtPayload {
  sub: string; // user id
  sessionId: string;
  departmentId: string | null;
  role: string;
}

export interface IJwtService {
  signAccessToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload | null>;
}
