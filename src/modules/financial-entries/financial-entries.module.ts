import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreateManualFinancialEntryUseCase } from './application/use-cases/create-manual-financial-entry.use-case';
import { ImportFinancialEntriesUseCase } from './application/use-cases/import-financial-entries.use-case';
import { ListFinancialEntriesUseCase } from './application/use-cases/list-financial-entries.use-case';
import { GetFinancialEntryUseCase } from './application/use-cases/get-financial-entry.use-case';
import { UpdateFinancialEntryUseCase } from './application/use-cases/update-financial-entry.use-case';
import { DeleteFinancialEntryUseCase } from './application/use-cases/delete-financial-entry.use-case';
import { GetFinancialSummaryUseCase } from './application/use-cases/get-financial-summary.use-case';
import { CsvFinancialEntryParser } from './application/services/csv-financial-entry-parser';
import {
  FINANCIAL_ENTRY_REPOSITORY,
  FinancialEntryRepository,
} from './domain/repositories/financial-entry.repository';
import { FinancialEntryPrismaRepository } from './infrastructure/database/prisma/repositories/financial-entry-prisma.repository';
import { FinancialEntriesController } from './presentation/http/controllers/financial-entries.controller';

@Module({
  imports: [AuthModule],
  controllers: [FinancialEntriesController],
  providers: [
    CsvFinancialEntryParser,
    {
      provide: FINANCIAL_ENTRY_REPOSITORY,
      useClass: FinancialEntryPrismaRepository,
    },
    {
      provide: CreateManualFinancialEntryUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new CreateManualFinancialEntryUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
    {
      provide: ImportFinancialEntriesUseCase,
      useFactory: (repository: FinancialEntryRepository, parser: CsvFinancialEntryParser) =>
        new ImportFinancialEntriesUseCase(repository, parser),
      inject: [FINANCIAL_ENTRY_REPOSITORY, CsvFinancialEntryParser],
    },
    {
      provide: ListFinancialEntriesUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new ListFinancialEntriesUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetFinancialEntryUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new GetFinancialEntryUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
    {
      provide: UpdateFinancialEntryUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new UpdateFinancialEntryUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
    {
      provide: DeleteFinancialEntryUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new DeleteFinancialEntryUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetFinancialSummaryUseCase,
      useFactory: (repository: FinancialEntryRepository) =>
        new GetFinancialSummaryUseCase(repository),
      inject: [FINANCIAL_ENTRY_REPOSITORY],
    },
  ],
})
export class FinancialEntriesModule {}
