import { EmployerToken } from '../../domain/entities/employer-token.entity';

export abstract class IEmployerTokenRepository {
  abstract findByTokenHash(tokenHash: string): Promise<EmployerToken | null>;
  abstract create(token: EmployerToken): Promise<EmployerToken>;
  abstract update(token: EmployerToken): Promise<EmployerToken>;
}
