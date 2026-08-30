import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { IPasswordResetTokenRepository } from '../../application/ports/password-reset-token.repository.port';
import { PasswordResetTokenEntity } from '../database/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private readonly passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
  ) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const entity = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
    });
    return entity ? PasswordResetTokenMapper.toDomain(entity) : null;
  }

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const entity = PasswordResetTokenMapper.toPersistence(token);
    const saved = await this.passwordResetTokenRepository.save(entity);
    return PasswordResetTokenMapper.toDomain(saved);
  }

  async update(token: PasswordResetToken): Promise<PasswordResetToken> {
    const entity = PasswordResetTokenMapper.toPersistence(token);
    await this.passwordResetTokenRepository.update({ id: token.id }, entity);
    const updated = await this.passwordResetTokenRepository.findOne({
      where: { id: token.id },
    });
    return updated ? PasswordResetTokenMapper.toDomain(updated) : token;
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.passwordResetTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .execute();
  }
}
