export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface TokenGenerator {
  signAccessToken(payload: Record<string, unknown>): Promise<string>;
  signRefreshToken(payload: Record<string, unknown>): Promise<string>;
  verifyAccessToken(token: string): Promise<Record<string, unknown>>;
  verifyRefreshToken(token: string): Promise<Record<string, unknown>>;
}
