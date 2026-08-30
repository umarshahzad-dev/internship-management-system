import { UserSecurityState } from '../../domain/entities/user-security-state.entity';

export abstract class IUserSecurityStateRepository {
  abstract findByUserId(userId: string): Promise<UserSecurityState | null>;
  abstract create(state: UserSecurityState): Promise<UserSecurityState>;
  abstract update(state: UserSecurityState): Promise<UserSecurityState>;
}
