import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry.errors';
import { FinancialEntryInMemoryRepository } from '../../infrastructure/database/in-memory/financial-entry-in-memory.repository';
import { DeleteFinancialEntryUseCase } from './delete-financial-entry.use-case';
import { GetFinancialEntryUseCase } from './get-financial-entry.use-case';
import { GetFinancialSummaryUseCase } from './get-financial-summary.use-case';
import { UpdateFinancialEntryUseCase } from './update-financial-entry.use-case';

describe('Financial entry CRUD use cases', () => {
  const userId = '467783ef-5b38-4cf4-a130-cabdd38d4891';
  const otherUserId = '1d621133-68e6-4a25-bf0a-d8d565350cb8';

  it('gets and updates an entry without changing its audit origin', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const entry = createEntry(userId, 'Salário', 350_000n, 'ENTRADA');
    await repository.create(entry);

    const found = await new GetFinancialEntryUseCase(repository).execute(userId, entry.id);
    expect(found.id).toBe(entry.id);

    const updated = await new UpdateFinancialEntryUseCase(repository).execute(userId, entry.id, {
      lugar: 'Salário mensal',
      valor: 3600,
      mesReferencia: '2026-08',
    });
    expect(updated).toMatchObject({
      place: 'Salário mensal',
      type: 'ENTRADA',
      origin: 'MANUAL',
    });
    expect(updated.amount).toBe('3600.00');
    expect(updated.referenceMonth.toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });

  it('does not expose or delete another user entry', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const entry = createEntry(otherUserId, 'Salário', 350_000n, 'ENTRADA');
    await repository.create(entry);

    await expect(
      new GetFinancialEntryUseCase(repository).execute(userId, entry.id),
    ).rejects.toThrow(FinancialEntryNotFoundError);
    await expect(
      new DeleteFinancialEntryUseCase(repository).execute(userId, entry.id),
    ).rejects.toThrow(FinancialEntryNotFoundError);
    expect(repository.entries).toHaveLength(1);
  });

  it('deletes an owned entry', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const entry = createEntry(userId, 'Conta', 10_000n, 'SAIDA');
    await repository.create(entry);

    await new DeleteFinancialEntryUseCase(repository).execute(userId, entry.id);
    expect(repository.entries).toHaveLength(0);
  });

  it('calculates income, expenses and balance for one month', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    await repository.createMany([
      createEntry(userId, 'Salário', 350_000n, 'ENTRADA'),
      createEntry(userId, 'Freelance', 50_000n, 'ENTRADA'),
      createEntry(userId, 'Contas', 183_245n, 'SAIDA'),
      createEntry(otherUserId, 'Outra pessoa', 999_999n, 'ENTRADA'),
    ]);

    const summary = await new GetFinancialSummaryUseCase(repository).execute(userId, '2026-07');
    expect(summary).toEqual({
      referenceMonth: '2026-07',
      totalIncome: '4000.00',
      totalExpense: '1832.45',
      balance: '2167.55',
      incomeCount: 2,
      expenseCount: 1,
    });
  });
});

function createEntry(
  userId: string,
  place: string,
  amountInCents: bigint,
  type: 'ENTRADA' | 'SAIDA',
): FinancialEntry {
  return FinancialEntry.create({
    userId,
    place,
    amountInCents,
    origin: 'MANUAL',
    type,
    referenceMonth: new Date('2026-07-01T00:00:00.000Z'),
  });
}
