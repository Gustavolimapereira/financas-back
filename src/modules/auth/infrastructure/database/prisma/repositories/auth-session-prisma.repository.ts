import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma/prisma.service';
import { AuthSessionRepository } from '../../../../domain/repositories/auth-session.repository';
import { AuthSession } from '../../../../domain/entities/auth-session.entity';

@Injectable()
export class AuthSessionPrismaRepository implements AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: AuthSession): Promise<AuthSession> {
    const created = await this.prisma.authSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        createdAt: session.createdAt,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<AuthSession | null> {
    const session = await this.prisma.authSession.findUnique({ where: { id } });
    return session ? this.toDomain(session) : null;
  }

  async findValidByUserId(userId: string): Promise<AuthSession | null> {
    const session = await this.prisma.authSession.findFirst({
      where: {
        userId,
        revokedAt: null,
      },
    });
    return session ? this.toDomain(session) : null;
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null> {
    const session = await this.prisma.authSession.findFirst({ where: { refreshTokenHash } });
    return session ? this.toDomain(session) : null;
  }

  async save(session: AuthSession): Promise<AuthSession> {
    const updated = await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
      },
    });
    return this.toDomain(updated);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  private toDomain(record: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }): AuthSession {
    return AuthSession.create({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt,
      createdAt: record.createdAt,
    });
  }
}
