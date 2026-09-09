import { AuthSession } from '../../../domain/entities/auth-session.entity';
import { AuthSessionRepository } from '../../../domain/repositories/auth-session.repository';

export class InMemoryAuthSessionRepository implements AuthSessionRepository {
  private sessions: AuthSession[] = [];

  async create(session: AuthSession): Promise<AuthSession> {
    this.sessions.push(session);
    return session;
  }

  async findById(id: string): Promise<AuthSession | null> {
    return this.sessions.find((session) => session.id === id) ?? null;
  }

  async findValidByUserId(userId: string): Promise<AuthSession | null> {
    return (
      this.sessions.find(
        (session) =>
          session.userId === userId && !session.isRevoked() && !session.isExpired(new Date()),
      ) ?? null
    );
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null> {
    return this.sessions.find((session) => session.refreshTokenHash === refreshTokenHash) ?? null;
  }

  async save(session: AuthSession): Promise<AuthSession> {
    this.sessions = this.sessions.map((current) => (current.id === session.id ? session : current));
    return session;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    this.sessions = this.sessions.map((session) => {
      if (session.userId === userId) {
        session.revoke();
      }
      return session;
    });
  }
}
