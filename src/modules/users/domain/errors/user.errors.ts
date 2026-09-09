export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(id?: string) {
    super(id ? `User with id ${id} not found` : 'User not found');
    this.name = 'UserNotFoundError';
  }
}

export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserDataError';
  }
}
