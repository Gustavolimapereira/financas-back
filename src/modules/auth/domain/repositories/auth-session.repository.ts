import { AuthSession } from '../entities/auth-session.entity';

export const AUTH_SESSION_REPOSITORY = Symbol('AUTH_SESSION_REPOSITORY');

export interface AuthSessionRepository {
  create(session: AuthSession): Promise<AuthSession>;
  findById(id: string): Promise<AuthSession | null>;
  findValidByUserId(userId: string): Promise<AuthSession | null>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null>;
  save(session: AuthSession): Promise<AuthSession>;
  revokeAllForUser(userId: string): Promise<void>;
}
