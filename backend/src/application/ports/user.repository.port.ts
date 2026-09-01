import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

export abstract class IUserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(user: User): Promise<User>;
  abstract update(user: User): Promise<User>;
  abstract findByDepartment(departmentId: string): Promise<User[]>;
  abstract findByDepartmentAndStudentNumber(
    departmentId: string,
    studentNumber: string | null,
  ): Promise<User | null>;
}
