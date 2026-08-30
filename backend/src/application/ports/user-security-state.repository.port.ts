import { UserSecurityState } from '../../domain/entities/user-security-state.entity';

export interface IUserSecurityStateRepository {
  findByUserId(userId: string): Promise<UserSecurityState | null>;
  create(state: UserSecurityState): Promise<UserSecurityState>;
  update(state: UserSecurityState): Promise<UserSecurityState>;
}
