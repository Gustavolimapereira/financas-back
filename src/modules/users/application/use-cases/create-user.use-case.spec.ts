import { CreateUserUseCase } from './create-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/database/prisma/repositories/user-in-memory.repository';
import { Argon2PasswordHasher } from '../../../auth/infrastructure/cryptography/argon2-password-hasher';
import { UserAlreadyExistsError } from '../../domain/errors/user.errors';

describe('CreateUserUseCase', () => {
  it('creates a user', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new Argon2PasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    const user = await useCase.execute({
      name: 'Gustavo',
      email: 'gustavo@email.com',
      password: 'senha123',
    });

    expect(user.email).toBe('gustavo@email.com');
    expect(user.passwordHash).not.toBe('senha123');
  });

  it('throws on duplicate email', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new Argon2PasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    await useCase.execute({ name: 'Gustavo', email: 'gustavo@email.com', password: 'senha123' });

    await expect(
      useCase.execute({ name: 'Gustavo', email: 'gustavo@email.com', password: 'senha123' }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
