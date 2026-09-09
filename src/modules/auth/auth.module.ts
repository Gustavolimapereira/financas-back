import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { HealthController } from './presentation/http/controllers/health.controller';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { JwtTokenGenerator } from './infrastructure/jwt/jwt-token-generator';
import { AuthSessionPrismaRepository } from './infrastructure/database/prisma/repositories/auth-session-prisma.repository';
import {
  AUTH_SESSION_REPOSITORY,
  AuthSessionRepository,
} from './domain/repositories/auth-session.repository';
import { TOKEN_GENERATOR, TokenGenerator } from './application/ports/token-generator';
import { PASSWORD_HASHER, PasswordHasher } from '../users/application/ports/password-hasher';
import { USER_REPOSITORY, UserRepository } from '../users/domain/repositories/user.repository';
import { UsersModule } from '../users/users.module';
import { env } from '../../shared/config/env';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/http/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    JwtTokenGenerator,
    AuthSessionPrismaRepository,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: TOKEN_GENERATOR,
      useExisting: JwtTokenGenerator,
    },
    {
      provide: AUTH_SESSION_REPOSITORY,
      useExisting: AuthSessionPrismaRepository,
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (
        users: UserRepository,
        hasher: PasswordHasher,
        sessions: AuthSessionRepository,
        tokens: TokenGenerator,
      ) => new AuthenticateUserUseCase(users, hasher, sessions, tokens),
      inject: [USER_REPOSITORY, PASSWORD_HASHER, AUTH_SESSION_REPOSITORY, TOKEN_GENERATOR],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (
        sessions: AuthSessionRepository,
        tokens: TokenGenerator,
        users: UserRepository,
      ) => new RefreshTokenUseCase(sessions, tokens, users),
      inject: [AUTH_SESSION_REPOSITORY, TOKEN_GENERATOR, USER_REPOSITORY],
    },
    {
      provide: LogoutUseCase,
      useFactory: (sessions: AuthSessionRepository) => new LogoutUseCase(sessions),
      inject: [AUTH_SESSION_REPOSITORY],
    },
  ],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
