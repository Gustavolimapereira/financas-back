import { User } from '../../domain/entities/user.entity';
import { InvalidUserDataError, UserAlreadyExistsError } from '../../domain/errors/user.errors';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../ports/password-hasher';
import { randomUUID } from 'crypto';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: { name: string; email: string; password: string }): Promise<User> {
    if (input.name.trim().length < 3) {
      throw new InvalidUserDataError('Name must have at least 3 characters');
    }
    if (input.password.length < 8) {
      throw new InvalidUserDataError('Password must have at least 8 characters');
    }
    const existing = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return this.userRepository.create(user);
  }
}
