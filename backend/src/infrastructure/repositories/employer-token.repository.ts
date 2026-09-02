import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { EmployerToken } from '../../domain/entities/employer-token.entity';
import { IEmployerTokenRepository } from '../../application/ports/employer-token.repository.port';
import { EmployerTokenEntity } from '../database/entities/employer-token.entity';
import { EmployerTokenMapper } from '../mappers/employer-token.mapper';

@Injectable()
export class EmployerTokenRepository extends IEmployerTokenRepository {
  constructor(
    @InjectRepository(EmployerTokenEntity)
    private readonly employerTokenRepository: Repository<EmployerTokenEntity>,
  ) {
    super();
  }

  async findByTokenHash(tokenHash: string): Promise<EmployerToken | null> {
    const entity = await this.employerTokenRepository.findOne({
      where: { tokenHash },
    });
    return entity ? EmployerTokenMapper.toDomain(entity) : null;
  }

  async findActiveByInternship(
    internshipId: string,
  ): Promise<EmployerToken | null> {
    const entity = await this.employerTokenRepository.findOne({
      where: { internshipId, isUsed: false, usedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return entity ? EmployerTokenMapper.toDomain(entity) : null;
  }

  async create(token: EmployerToken): Promise<EmployerToken> {
    const entity = EmployerTokenMapper.toPersistence(token);
    const saved = await this.employerTokenRepository.save(entity);
    return EmployerTokenMapper.toDomain(saved);
  }

  async update(token: EmployerToken): Promise<EmployerToken> {
    const entity = EmployerTokenMapper.toPersistence(token);
    await this.employerTokenRepository.update(
      { tokenHash: token.tokenHash },
      entity,
    );
    const updated = await this.employerTokenRepository.findOne({
      where: { tokenHash: token.tokenHash },
    });
    return updated ? EmployerTokenMapper.toDomain(updated) : token;
  }
}
