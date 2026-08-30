import { Session } from '../../domain/entities/session.entity';

export abstract class ISessionRepository {
  abstract findById(id: string): Promise<Session | null>;
  abstract create(session: Session): Promise<Session>;
  abstract update(session: Session): Promise<Session>;
  abstract revoke(id: string, revokedAt: Date): Promise<void>;
  abstract revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
  abstract touch(id: string, lastActivityAt: Date): Promise<void>;
  abstract deleteExpired(now: Date): Promise<void>;
}
