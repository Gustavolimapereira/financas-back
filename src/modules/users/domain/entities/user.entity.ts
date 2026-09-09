import { InvalidUserDataError } from '../errors/user.errors';
import { EmailValueObject } from '../value-objects/email.value-object';

export type UserRole = 'USER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const name = props.name.trim();
    if (name.length < 3) {
      throw new InvalidUserDataError('Name must have at least 3 characters');
    }
    const email = new EmailValueObject(props.email).toString();

    return new User(
      props.id,
      name,
      email,
      props.passwordHash,
      props.role ?? 'USER',
      props.isActive ?? true,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  changeName(name: string): void {
    const normalizedName = name.trim();
    if (normalizedName.length < 3) {
      throw new InvalidUserDataError('Name must have at least 3 characters');
    }
    this.name = normalizedName;
    this.updatedAt = new Date();
  }

  changeEmail(email: string): void {
    this.email = new EmailValueObject(email).toString();
    this.updatedAt = new Date();
  }

  changePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
