import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../ports/user.repository.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

export interface GetUserInput {
  userId: string;
  currentUserId: string;
  currentUserRole: string;
}

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new DomainException('NOT_FOUND', 'User not found', 404);
    }

    // Users can view themselves; only admin can view others
    if (
      input.currentUserRole !== 'ADMIN' &&
      input.currentUserId !== input.userId
    ) {
      throw new DomainException('FORBIDDEN', 'Insufficient permissions', 403);
    }

    return {
      id: user.id,
      email: user.email.toValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.getValue(),
      departmentId: user.departmentId,
      studentNumber: user.studentNumber,
      isActive: user.isActive,
    };
  }
}
