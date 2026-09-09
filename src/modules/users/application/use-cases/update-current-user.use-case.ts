import { User } from '../../domain/entities/user.entity';
import {
  InvalidUserDataError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/errors/user.errors';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../ports/password-hasher';

export class UpdateCurrentUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    userId: string,
    input: { name?: string; email?: string; password?: string },
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    if (input.name !== undefined) {
      user.changeName(input.name);
    }

    if (input.email !== undefined) {
      const existing = await this.userRepository.findByEmail(input.email.toLowerCase());
      if (existing && existing.id !== userId) {
        throw new UserAlreadyExistsError(input.email);
      }
      user.changeEmail(input.email);
    }

    if (input.password !== undefined) {
      if (input.password.length < 8) {
        throw new InvalidUserDataError('Password must have at least 8 characters');
      }
      const passwordHash = await this.passwordHasher.hash(input.password);
      user.changePassword(passwordHash);
    }

    return this.userRepository.save(user);
  }
}
