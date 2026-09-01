import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { IUserRepository } from '../../application/ports/user.repository.port';
import { UserEntity } from '../database/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository extends IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { email: email.toValue() },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.userRepository.find({
      order: { createdAt: 'ASC' },
    });
    return entities.map(UserMapper.toDomain);
  }

  async create(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);
    const saved = await this.userRepository.save(entity);
    return UserMapper.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);
    await this.userRepository.update({ id: user.id }, entity);
    const updated = await this.userRepository.findOne({
      where: { id: user.id },
    });
    return updated ? UserMapper.toDomain(updated) : user;
  }

  async findByDepartment(departmentId: string): Promise<User[]> {
    const entities = await this.userRepository.find({
      where: { departmentId },
    });
    return entities.map(UserMapper.toDomain);
  }

  async findByDepartmentAndStudentNumber(
    departmentId: string,
    studentNumber: string | null,
  ): Promise<User | null> {
    if (!studentNumber) {
      return null;
    }
    const entity = await this.userRepository.findOne({
      where: { departmentId, studentNumber },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }
}
