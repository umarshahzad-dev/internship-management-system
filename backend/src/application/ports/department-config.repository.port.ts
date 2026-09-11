import { DepartmentConfig } from '../../domain/entities/department-config.entity'
export abstract class IDepartmentConfigRepository {
  abstract find(departmentId: string, key: string): Promise<DepartmentConfig | null>
  abstract findByDepartment(departmentId: string): Promise<DepartmentConfig[]>
  abstract upsert(config: DepartmentConfig): Promise<DepartmentConfig>
  abstract delete(departmentId: string, key: string): Promise<void>
}
