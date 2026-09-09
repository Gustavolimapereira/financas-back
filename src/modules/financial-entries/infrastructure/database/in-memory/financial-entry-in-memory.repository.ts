import { FinancialEntry } from '../../../domain/entities/financial-entry.entity';
import {
  FinancialEntryRepository,
  FinancialEntriesSummary,
  FindFinancialEntriesByUserParams,
} from '../../../domain/repositories/financial-entry.repository';

export class FinancialEntryInMemoryRepository implements FinancialEntryRepository {
  readonly entries: FinancialEntry[] = [];

  async create(entry: FinancialEntry): Promise<FinancialEntry> {
    this.entries.push(entry);
    return entry;
  }

  async createMany(entries: FinancialEntry[]): Promise<FinancialEntry[]> {
    this.entries.push(...entries);
    return entries;
  }

  async findByIdAndUser(id: string, userId: string): Promise<FinancialEntry | null> {
    return this.entries.find((entry) => entry.id === id && entry.userId === userId) ?? null;
  }

  async findManyByUser(
    params: FindFinancialEntriesByUserParams,
  ): Promise<{ entries: FinancialEntry[]; total: number }> {
    const filtered = this.entries
      .filter((entry) => entry.userId === params.userId)
      .filter(
        (entry) =>
          !params.referenceMonth ||
          entry.referenceMonth.getTime() === params.referenceMonth.getTime(),
      )
      .filter((entry) => !params.origin || entry.origin === params.origin)
      .filter((entry) => !params.type || entry.type === params.type)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    return {
      entries: filtered.slice(params.skip, params.skip + params.take),
      total: filtered.length,
    };
  }

  async save(entry: FinancialEntry): Promise<FinancialEntry> {
    const index = this.entries.findIndex((item) => item.id === entry.id);
    if (index >= 0) this.entries[index] = entry;
    return entry;
  }

  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    const index = this.entries.findIndex((entry) => entry.id === id && entry.userId === userId);
    if (index < 0) return false;
    this.entries.splice(index, 1);
    return true;
  }

  async summarizeByMonth(userId: string, referenceMonth: Date): Promise<FinancialEntriesSummary> {
    const entries = this.entries.filter(
      (entry) =>
        entry.userId === userId && entry.referenceMonth.getTime() === referenceMonth.getTime(),
    );
    const income = entries.filter((entry) => entry.type === 'ENTRADA');
    const expense = entries.filter((entry) => entry.type === 'SAIDA');
    return {
      totalIncomeInCents: income.reduce((total, entry) => total + entry.amountInCents, 0n),
      totalExpenseInCents: expense.reduce((total, entry) => total + entry.amountInCents, 0n),
      incomeCount: income.length,
      expenseCount: expense.length,
    };
  }
}
