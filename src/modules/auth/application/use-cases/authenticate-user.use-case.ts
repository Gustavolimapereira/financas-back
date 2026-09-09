import { createHash, randomUUID } from 'crypto';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { PasswordHasher } from '../../../users/application/ports/password-hasher';
import { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { InvalidCredentialsError, InactiveUserError } from '../../domain/errors/auth.errors';
import { TokenGenerator } from '../ports/token-generator';

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (!user || !(await this.passwordHasher.compare(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    const accessToken = await this.tokenGenerator.signAccessToken({
      sub: user.id,
      role: user.role,
    });
    const refreshToken = await this.tokenGenerator.signRefreshToken({ sub: user.id });
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = await this.getRefreshTokenExpiration(refreshToken);

    await this.authSessionRepository.revokeAllForUser(user.id);
    await this.authSessionRepository.create(
      AuthSession.create({
        id: randomUUID(),
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      }),
    );

    return { accessToken, refreshToken, user };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async getRefreshTokenExpiration(token: string): Promise<Date> {
    const payload = await this.tokenGenerator.verifyRefreshToken(token);
    if (typeof payload.exp !== 'number') {
      throw new Error('Refresh token must contain an expiration');
    }
    return new Date(payload.exp * 1000);
  }
}
