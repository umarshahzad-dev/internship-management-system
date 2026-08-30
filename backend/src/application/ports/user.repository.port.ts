import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findByDepartment(departmentId: string): Promise<User[]>;
}
