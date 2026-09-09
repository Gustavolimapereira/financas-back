import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { parseReferenceMonth } from '../services/reference-month';

export class GetFinancialSummaryUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  async execute(userId: string, referenceMonthValue: string) {
    const summary = await this.repository.summarizeByMonth(
      userId,
      parseReferenceMonth(referenceMonthValue),
    );

    return {
      referenceMonth: referenceMonthValue,
      totalIncome: this.formatMoney(summary.totalIncomeInCents),
      totalExpense: this.formatMoney(summary.totalExpenseInCents),
      balance: this.formatMoney(summary.totalIncomeInCents - summary.totalExpenseInCents),
      incomeCount: summary.incomeCount,
      expenseCount: summary.expenseCount,
    };
  }

  private formatMoney(amountInCents: bigint): string {
    const negative = amountInCents < 0n;
    const absolute = negative ? -amountInCents : amountInCents;
    return `${negative ? '-' : ''}${absolute / 100n}.${(absolute % 100n)
      .toString()
      .padStart(2, '0')}`;
  }
}
