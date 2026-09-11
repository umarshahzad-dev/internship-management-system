import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(filters: { search?: string; role?: string; departmentId?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string } = {}) {
    const users = await this.userRepository.findAll();
    const search = filters.search?.toLocaleLowerCase('tr-TR');
    const filtered = users.filter((user) => (!search || `${user.firstName} ${user.lastName} ${user.email.toValue()}`.toLocaleLowerCase('tr-TR').includes(search)) && (!filters.role || user.role.getValue() === filters.role) && (!filters.departmentId || user.departmentId === filters.departmentId));
    const sortBy = filters.sortBy === 'email' ? 'email' : filters.sortBy === 'firstName' ? 'firstName' : 'lastName';
    filtered.sort((a, b) => { const left = sortBy === 'email' ? a.email.toValue() : a[sortBy]; const right = sortBy === 'email' ? b.email.toValue() : b[sortBy]; const result = String(left).localeCompare(String(right), 'tr'); return filters.sortDir === 'desc' ? -result : result; });
    const page = Math.max(1, filters.page ?? 1); const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20)); const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((user) => ({
      id: user.id,
      email: user.email.toValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.getValue(),
      departmentId: user.departmentId,
      studentNumber: user.studentNumber,
      isActive: user.isActive,
      profilePhotoPath: user.profilePhotoPath, // <-- added
    }));
    return { items, total: filtered.length, page, pageSize };
  }
}
