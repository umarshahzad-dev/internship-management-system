export interface PaginatedResult<T> { items: T[]; page: number; pageSize: number; total: number }

export function paginate<T>(items: T[], pageInput?: string, pageSizeInput?: string): PaginatedResult<T> {
  const page = Math.max(1, Number.parseInt(pageInput ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(pageSizeInput ?? '25', 10) || 25));
  const total = items.length;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total };
}
