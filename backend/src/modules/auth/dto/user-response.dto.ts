import { UserRole } from '../../../domain/value-objects/role.vo';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: string | null;
}
