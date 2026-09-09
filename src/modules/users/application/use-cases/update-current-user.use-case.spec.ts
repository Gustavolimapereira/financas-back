import { UpdateCurrentUserUseCase } from './update-current-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/database/prisma/repositories/user-in-memory.repository';
import { Argon2PasswordHasher } from '../../../auth/infrastructure/cryptography/argon2-password-hasher';
import { User } from '../../domain/entities/user.entity';

describe('UpdateCurrentUserUseCase', () => {
  it('updates a user', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new Argon2PasswordHasher();
    const useCase = new UpdateCurrentUserUseCase(repo, hasher);
    const user = User.create({
      id: '1',
      name: 'Gustavo',
      email: 'gustavo@email.com',
      passwordHash: await hasher.hash('senha123'),
    });
    await repo.create(user);

    const updated = await useCase.execute('1', { name: 'Gustavo Lima' });

    expect(updated.name).toBe('Gustavo Lima');
  });
});
