import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../domain/entities/announcement.entity';
import { UserRole } from '../../domain/value-objects/role.vo';
import { IAnnouncementRepository } from '../../application/ports/announcement.repository.port';
import { AnnouncementEntity } from '../database/entities/announcement.entity';
import { AnnouncementMapper } from '../mappers/announcement.mapper';

@Injectable()
export class AnnouncementRepository extends IAnnouncementRepository {
  constructor(@InjectRepository(AnnouncementEntity) private readonly repo: Repository<AnnouncementEntity>) { super(); }
  async findById(id: string) { const row = await this.repo.findOne({ where: { id } }); return row ? AnnouncementMapper.toDomain(row) : null; }
  async findAll() { const rows = await this.repo.find({ order: { createdAt: 'DESC' } }); return rows.map(AnnouncementMapper.toDomain); }
  async findActiveForUser(role: UserRole, departmentId: string | null, now: Date) {
    const rows = await this.repo.createQueryBuilder('a').where(':role = ANY(a.target_roles)', { role }).andWhere('a.is_active = true').andWhere('(a.expires_at IS NULL OR a.expires_at > :now)', { now }).andWhere('(a.department_id IS NULL OR a.department_id = :departmentId)', { departmentId }).orderBy('a.created_at', 'DESC').getMany();
    return rows.map(AnnouncementMapper.toDomain);
  }
  async create(announcement: Announcement) { return AnnouncementMapper.toDomain(await this.repo.save(AnnouncementMapper.toPersistence(announcement))); }
  async update(announcement: Announcement) { await this.repo.update({ id: announcement.id }, AnnouncementMapper.toPersistence(announcement)); return (await this.findById(announcement.id)) ?? announcement; }
  async delete(id: string) { await this.repo.delete({ id }); }
}
