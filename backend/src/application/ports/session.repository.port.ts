import { Session } from '../../domain/entities/session.entity';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  create(session: Session): Promise<Session>;
  update(session: Session): Promise<Session>;
  revoke(id: string, revokedAt: Date): Promise<void>;
  revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}
