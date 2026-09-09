import { RefreshTokenUseCase } from './refresh-token.use-case';
import { InMemoryAuthSessionRepository } from '../../infrastructure/database/in-memory/auth-session-in-memory.repository';
import { FakeTokenGenerator } from '../../infrastructure/jwt/fake-token-generator';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
} from '../../domain/errors/auth.errors';
import { createHash } from 'crypto';
import { InMemoryUserRepository } from '../../../users/infrastructure/database/prisma/repositories/user-in-memory.repository';
import { User } from '../../../users/domain/entities/user.entity';

function createUseCase() {
  const sessions = new InMemoryAuthSessionRepository();
  const tokens = new FakeTokenGenerator();
  const users = new InMemoryUserRepository();
  const useCase = new RefreshTokenUseCase(sessions, tokens, users);

  return { sessions, tokens, users, useCase };
}

async function addUser(users: InMemoryUserRepository) {
  await users.create(
    User.create({
      id: 'user-1',
      name: 'Gustavo',
      email: 'gustavo@email.com',
      passwordHash: 'hash',
    }),
  );
}

describe('RefreshTokenUseCase', () => {
  it('refreshes a valid token', async () => {
    const { sessions, users, useCase } = createUseCase();
    await addUser(users);
    const refreshToken =
      'refresh.' + Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64');
    const session = AuthSession.create({
      id: '1',
      userId: 'user-1',
      refreshTokenHash: createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await sessions.create(session);

    const result = await useCase.execute({ refreshToken });

    expect(result.accessToken).toContain('access.');
    expect(result.refreshToken).toContain('refresh.');
  });

  it('throws for expired refresh token', async () => {
    const { sessions, users, useCase } = createUseCase();
    await addUser(users);
    const refreshToken =
      'refresh.' + Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64');
    const session = AuthSession.create({
      id: '2',
      userId: 'user-1',
      refreshTokenHash: createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
    });
    await sessions.create(session);

    await expect(useCase.execute({ refreshToken })).rejects.toThrow(ExpiredRefreshTokenError);
  });

  it('throws for revoked refresh token', async () => {
    const { sessions, users, useCase } = createUseCase();
    await addUser(users);
    const refreshToken =
      'refresh.' + Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64');
    const session = AuthSession.create({
      id: '3',
      userId: 'user-1',
      refreshTokenHash: createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    session.revoke();
    await sessions.create(session);

    await expect(useCase.execute({ refreshToken })).rejects.toThrow(InvalidRefreshTokenError);
  });
});
