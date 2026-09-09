import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateCurrentUserUseCase } from './application/use-cases/update-current-user.use-case';
import { UserPrismaRepository } from './infrastructure/database/prisma/repositories/user-prisma.repository';
import { UsersController } from './presentation/http/controllers/users.controller';
import { USER_REPOSITORY, UserRepository } from './domain/repositories/user.repository';
import { PASSWORD_HASHER, PasswordHasher } from './application/ports/password-hasher';
import { Argon2PasswordHasher } from '../../shared/infrastructure/cryptography/argon2-password-hasher';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: CreateUserUseCase,
      useFactory: (repository: UserRepository, hasher: PasswordHasher) =>
        new CreateUserUseCase(repository, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: (repository: UserRepository) => new GetCurrentUserUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (repository: UserRepository) => new GetUserByIdUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateCurrentUserUseCase,
      useFactory: (repository: UserRepository, hasher: PasswordHasher) =>
        new UpdateCurrentUserUseCase(repository, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER],
})
export class UsersModule {}
