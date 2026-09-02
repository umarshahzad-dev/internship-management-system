import { Internship } from '../../domain/entities/internship.entity';
import { InternshipStatus } from '../../domain/enums/internship-status.enum';

export abstract class IInternshipRepository {
  abstract findById(id: string): Promise<Internship | null>;
  abstract findAllByStudent(studentId: string): Promise<Internship[]>;
  abstract findAllByDepartment(departmentId: string): Promise<Internship[]>;
  abstract findActiveByStudent(studentId: string): Promise<Internship[]>;
  abstract create(internship: Internship): Promise<Internship>;
  abstract update(internship: Internship): Promise<Internship>;
}
