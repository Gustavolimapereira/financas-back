import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenGenerator } from '../../application/ports/token-generator';
import { env } from '../../../../shared/config/env';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
  }

  async signRefreshToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  async verifyAccessToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verifyAsync(token, { secret: env.JWT_ACCESS_SECRET });
  }

  async verifyRefreshToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verifyAsync(token, { secret: env.JWT_REFRESH_SECRET });
  }
}
