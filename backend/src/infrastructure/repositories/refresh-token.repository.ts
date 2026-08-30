import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../application/ports/refresh-token.repository.port';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Injectable()
export class RefreshTokenRepository extends IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {
    super();
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const entity = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });
    return entity ? RefreshTokenMapper.toDomain(entity) : null;
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    const entity = RefreshTokenMapper.toPersistence(token);
    const saved = await this.refreshTokenRepository.save(entity);
    return RefreshTokenMapper.toDomain(saved);
  }

  async update(token: RefreshToken): Promise<RefreshToken> {
    const entity = RefreshTokenMapper.toPersistence(token);
    await this.refreshTokenRepository.update({ id: token.id }, entity);
    const updated = await this.refreshTokenRepository.findOne({
      where: { id: token.id },
    });
    return updated ? RefreshTokenMapper.toDomain(updated) : token;
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt },
    );
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .execute();
  }
}
