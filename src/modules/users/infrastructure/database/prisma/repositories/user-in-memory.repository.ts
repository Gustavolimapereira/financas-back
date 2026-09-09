import { User } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async save(user: User): Promise<User> {
    this.users = this.users.map((current) => (current.id === user.id ? user : current));
    return user;
  }

  async findMany(): Promise<User[]> {
    return this.users;
  }
}
