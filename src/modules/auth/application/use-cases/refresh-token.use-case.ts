import { createHash, randomUUID } from 'crypto';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import {
  ExpiredRefreshTokenError,
  InactiveUserError,
  InvalidRefreshTokenError,
} from '../../domain/errors/auth.errors';
import { TokenGenerator } from '../ports/token-generator';

export class RefreshTokenUseCase {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly tokenGenerator: TokenGenerator,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    refreshToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: Record<string, unknown>;
    try {
      payload = await this.tokenGenerator.verifyRefreshToken(input.refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const userId = payload.sub;
    if (typeof userId !== 'string') {
      throw new InvalidRefreshTokenError();
    }
    const session = await this.authSessionRepository.findByRefreshTokenHash(
      this.hashRefreshToken(input.refreshToken),
    );
    if (!session || session.userId !== userId) {
      throw new InvalidRefreshTokenError();
    }

    if (session.isRevoked()) {
      throw new InvalidRefreshTokenError();
    }
    if (session.isExpired(new Date())) {
      throw new ExpiredRefreshTokenError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }
    if (!user.isActive) {
      throw new InactiveUserError();
    }

    session.revoke();
    await this.authSessionRepository.save(session);

    const newAccessToken = await this.tokenGenerator.signAccessToken({
      sub: userId,
      role: user.role,
    });
    const newRefreshToken = await this.tokenGenerator.signRefreshToken({ sub: userId });
    const newRefreshTokenPayload = await this.tokenGenerator.verifyRefreshToken(newRefreshToken);
    if (typeof newRefreshTokenPayload.exp !== 'number') {
      throw new InvalidRefreshTokenError();
    }
    const newSession = AuthSession.create({
      id: randomUUID(),
      userId,
      refreshTokenHash: this.hashRefreshToken(newRefreshToken),
      expiresAt: new Date(newRefreshTokenPayload.exp * 1000),
    });

    await this.authSessionRepository.create(newSession);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
