import { Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../ports/announcement.repository.port';
import { UserRole } from '../../../domain/value-objects/role.vo';
import { paginate, PaginatedResult } from '../../../common/pagination/paginate';

export interface AnnouncementListItem { id: string; title: string; content: string; targetRoles: UserRole[]; departmentId: string | null; expiresAt: string | null; isActive: boolean; createdAt: string; updatedAt: string }

@Injectable()
export class ListAnnouncementsForAdminUseCase {
  constructor(private readonly repo: IAnnouncementRepository) {}
  async execute(role: UserRole = UserRole.ADMIN, departmentId: string | null = null, options: { search?: string; page?: string; pageSize?: string; sortBy?: string; sortDir?: string } = {}): Promise<PaginatedResult<AnnouncementListItem>> {
    const all = await this.repo.findAll();
    const scoped = role === UserRole.ACADEMIC ? all.filter((item) => item.departmentId === departmentId) : all;
    const filtered = scoped.filter((item) => !options.search || `${item.title} ${item.content}`.toLocaleLowerCase('tr-TR').includes(options.search.toLocaleLowerCase('tr-TR')));
    const sorted = [...filtered].sort((a, b) => {
      const left = options.sortBy === 'title' ? a.title : a.createdAt.getTime();
      const right = options.sortBy === 'title' ? b.title : b.createdAt.getTime();
      const result = typeof left === 'string' ? left.localeCompare(right as string, 'tr-TR') : Number(left) - Number(right);
      return options.sortDir === 'asc' ? result : -result;
    });
    return paginate(sorted.map((item) => ({ id: item.id, title: item.title, content: item.content, targetRoles: item.targetRoles, departmentId: item.departmentId, expiresAt: item.expiresAt?.toISOString() ?? null, isActive: item.isActive, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })), options.page, options.pageSize);
  }
}
