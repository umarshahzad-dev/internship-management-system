import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';
import { UserRole } from '../../../domain/value-objects/role.vo';

export interface GetMeInput {
  userId: string;
}

export interface GetMeResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: string | null;
  profilePhotoPath: string | null; // <-- added
}

@Injectable()
export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetMeInput): Promise<GetMeResult | null> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email.toValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.getValue(),
      departmentId: user.departmentId,
      profilePhotoPath: user.profilePhotoPath, // <-- added
    };
  }
}
