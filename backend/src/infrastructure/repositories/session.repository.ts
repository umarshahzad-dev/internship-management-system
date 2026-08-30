import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../domain/entities/session.entity';
import { ISessionRepository } from '../../application/ports/session.repository.port';
import { SessionEntity } from '../database/entities/session.entity';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class SessionRepository extends ISessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.sessionRepository.findOne({ where: { id } });
    return entity ? SessionMapper.toDomain(entity) : null;
  }

  async create(session: Session): Promise<Session> {
    const entity = SessionMapper.toPersistence(session);
    const saved = await this.sessionRepository.save(entity);
    return SessionMapper.toDomain(saved);
  }

  async update(session: Session): Promise<Session> {
    const entity = SessionMapper.toPersistence(session);
    await this.sessionRepository.update({ id: session.id }, entity);
    const updated = await this.sessionRepository.findOne({
      where: { id: session.id },
    });
    return updated ? SessionMapper.toDomain(updated) : session;
  }

  async revoke(id: string, revokedAt: Date): Promise<void> {
    await this.sessionRepository.update({ id }, { revokedAt });
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    await this.sessionRepository.update(
      { userId, revokedAt: null },
      { revokedAt },
    );
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .execute();
  }
}
