import { InvalidUserDataError } from '../errors/user.errors';

export class EmailValueObject {
  constructor(public readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new InvalidUserDataError('Invalid email format');
    }
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  toString(): string {
    return this.value.toLowerCase();
  }
}
