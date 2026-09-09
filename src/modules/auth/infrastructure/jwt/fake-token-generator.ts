import { TokenGenerator } from '../../application/ports/token-generator';

export class FakeTokenGenerator implements TokenGenerator {
  async signAccessToken(payload: Record<string, unknown>): Promise<string> {
    return `access.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  }

  async signRefreshToken(payload: Record<string, unknown>): Promise<string> {
    return `refresh.${Buffer.from(
      JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }),
    ).toString('base64')}`;
  }

  async verifyAccessToken(token: string): Promise<Record<string, unknown>> {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8')) as Record<
      string,
      unknown
    >;
  }

  async verifyRefreshToken(token: string): Promise<Record<string, unknown>> {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8')) as Record<
      string,
      unknown
    >;
  }
}
