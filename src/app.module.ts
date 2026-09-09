import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { FinancialEntriesModule } from './modules/financial-entries/financial-entries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FinancialEntriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
