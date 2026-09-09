export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('User is inactive');
    this.name = 'InactiveUserError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}

export class ExpiredRefreshTokenError extends Error {
  constructor() {
    super('Refresh token expired');
    this.name = 'ExpiredRefreshTokenError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
