import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSecurityState } from '../../domain/entities/user-security-state.entity';
import { IUserSecurityStateRepository } from '../../application/ports/user-security-state.repository.port';
import { UserSecurityStateEntity } from '../database/entities/user-security-state.entity';
import { UserSecurityStateMapper } from '../mappers/user-security-state.mapper';

@Injectable()
export class UserSecurityStateRepository implements IUserSecurityStateRepository {
  constructor(
    @InjectRepository(UserSecurityStateEntity)
    private readonly securityStateRepository: Repository<UserSecurityStateEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserSecurityState | null> {
    const entity = await this.securityStateRepository.findOne({
      where: { userId },
    });
    return entity ? UserSecurityStateMapper.toDomain(entity) : null;
  }

  async create(state: UserSecurityState): Promise<UserSecurityState> {
    const entity = UserSecurityStateMapper.toPersistence(state);
    const saved = await this.securityStateRepository.save(entity);
    return UserSecurityStateMapper.toDomain(saved);
  }

  async update(state: UserSecurityState): Promise<UserSecurityState> {
    const entity = UserSecurityStateMapper.toPersistence(state);
    await this.securityStateRepository.update({ userId: state.userId }, entity);
    const updated = await this.securityStateRepository.findOne({
      where: { userId: state.userId },
    });
    return updated ? UserSecurityStateMapper.toDomain(updated) : state;
  }
}
