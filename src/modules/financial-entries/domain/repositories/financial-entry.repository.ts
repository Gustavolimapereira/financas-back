import {
  FinancialEntry,
  FinancialEntryOrigin,
  FinancialEntryType,
} from '../entities/financial-entry.entity';

export const FINANCIAL_ENTRY_REPOSITORY = Symbol('FINANCIAL_ENTRY_REPOSITORY');

export interface FindFinancialEntriesByUserParams {
  userId: string;
  referenceMonth?: Date;
  origin?: FinancialEntryOrigin;
  type?: FinancialEntryType;
  skip: number;
  take: number;
}

export interface FinancialEntriesSummary {
  totalIncomeInCents: bigint;
  totalExpenseInCents: bigint;
  incomeCount: number;
  expenseCount: number;
}

export interface FinancialEntryRepository {
  create(entry: FinancialEntry): Promise<FinancialEntry>;
  createMany(entries: FinancialEntry[]): Promise<FinancialEntry[]>;
  findByIdAndUser(id: string, userId: string): Promise<FinancialEntry | null>;
  findManyByUser(
    params: FindFinancialEntriesByUserParams,
  ): Promise<{ entries: FinancialEntry[]; total: number }>;
  save(entry: FinancialEntry): Promise<FinancialEntry>;
  deleteByIdAndUser(id: string, userId: string): Promise<boolean>;
  summarizeByMonth(userId: string, referenceMonth: Date): Promise<FinancialEntriesSummary>;
}
