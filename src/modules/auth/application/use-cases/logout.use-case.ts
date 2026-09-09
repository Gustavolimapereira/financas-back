import { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { createHash } from 'crypto';
import { InvalidRefreshTokenError } from '../../domain/errors/auth.errors';

export class LogoutUseCase {
  constructor(private readonly authSessionRepository: AuthSessionRepository) {}

  async execute(input: { refreshToken: string; userId: string }): Promise<void> {
    const session = await this.authSessionRepository.findByRefreshTokenHash(
      this.hashRefreshToken(input.refreshToken),
    );
    if (!session || session.userId !== input.userId) {
      throw new InvalidRefreshTokenError();
    }
    session.revoke();
    await this.authSessionRepository.save(session);
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
