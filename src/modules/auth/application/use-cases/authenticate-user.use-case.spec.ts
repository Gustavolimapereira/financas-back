import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { InMemoryUserRepository } from '../../../users/infrastructure/database/prisma/repositories/user-in-memory.repository';
import { InMemoryAuthSessionRepository } from '../../infrastructure/database/in-memory/auth-session-in-memory.repository';
import { Argon2PasswordHasher } from '../../infrastructure/cryptography/argon2-password-hasher';
import { FakeTokenGenerator } from '../../infrastructure/jwt/fake-token-generator';
import { User } from '../../../users/domain/entities/user.entity';
import { InvalidCredentialsError, InactiveUserError } from '../../domain/errors/auth.errors';

describe('AuthenticateUserUseCase', () => {
  it('authenticates a valid user', async () => {
    const users = new InMemoryUserRepository();
    const sessions = new InMemoryAuthSessionRepository();
    const hasher = new Argon2PasswordHasher();
    const tokens = new FakeTokenGenerator();
    const useCase = new AuthenticateUserUseCase(users, hasher, sessions, tokens);

    await users.create(
      User.create({
        id: '1',
        name: 'Gustavo',
        email: 'gustavo@email.com',
        passwordHash: await hasher.hash('senha123'),
      }),
    );

    const result = await useCase.execute({ email: 'gustavo@email.com', password: 'senha123' });

    expect(result.accessToken).toContain('access.');
    expect(result.refreshToken).toContain('refresh.');
  });

  it('throws on invalid password', async () => {
    const users = new InMemoryUserRepository();
    const sessions = new InMemoryAuthSessionRepository();
    const hasher = new Argon2PasswordHasher();
    const tokens = new FakeTokenGenerator();
    const useCase = new AuthenticateUserUseCase(users, hasher, sessions, tokens);

    await users.create(
      User.create({
        id: '1',
        name: 'Gustavo',
        email: 'gustavo@email.com',
        passwordHash: await hasher.hash('senha123'),
      }),
    );

    await expect(
      useCase.execute({ email: 'gustavo@email.com', password: 'wrong' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws for inactive users', async () => {
    const users = new InMemoryUserRepository();
    const sessions = new InMemoryAuthSessionRepository();
    const hasher = new Argon2PasswordHasher();
    const tokens = new FakeTokenGenerator();
    const useCase = new AuthenticateUserUseCase(users, hasher, sessions, tokens);

    const user = User.create({
      id: '1',
      name: 'Gustavo',
      email: 'gustavo@email.com',
      passwordHash: await hasher.hash('senha123'),
    });
    user.deactivate();
    await users.create(user);

    await expect(
      useCase.execute({ email: 'gustavo@email.com', password: 'senha123' }),
    ).rejects.toThrow(InactiveUserError);
  });
});
