export class AuthSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public refreshTokenHash: string,
    public expiresAt: Date,
    public revokedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt?: Date | null;
    createdAt?: Date;
  }): AuthSession {
    return new AuthSession(
      props.id,
      props.userId,
      props.refreshTokenHash,
      props.expiresAt,
      props.revokedAt ?? null,
      props.createdAt ?? new Date(),
    );
  }

  revoke(): void {
    this.revokedAt = new Date();
  }

  isExpired(now: Date): boolean {
    return this.expiresAt <= now;
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }
}
