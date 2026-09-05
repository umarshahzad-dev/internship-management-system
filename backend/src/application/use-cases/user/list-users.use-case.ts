import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute() {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
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
  }
}
