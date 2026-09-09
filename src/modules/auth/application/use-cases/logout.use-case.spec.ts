import { LogoutUseCase } from './logout.use-case';
import { InMemoryAuthSessionRepository } from '../../infrastructure/database/in-memory/auth-session-in-memory.repository';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { createHash } from 'crypto';

describe('LogoutUseCase', () => {
  it('revokes a session', async () => {
    const sessions = new InMemoryAuthSessionRepository();
    const useCase = new LogoutUseCase(sessions);
    const refreshToken = 'refresh-token';
    const session = AuthSession.create({
      id: '1',
      userId: 'user-1',
      refreshTokenHash: createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await sessions.create(session);

    await expect(useCase.execute({ refreshToken, userId: 'user-1' })).resolves.toBeUndefined();
    expect(session.isRevoked()).toBe(true);
  });
});
