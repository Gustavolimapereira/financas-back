import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { FinancialEntryInMemoryRepository } from '../../infrastructure/database/in-memory/financial-entry-in-memory.repository';
import { ListFinancialEntriesUseCase } from './list-financial-entries.use-case';

describe('ListFinancialEntriesUseCase', () => {
  const userId = '467783ef-5b38-4cf4-a130-cabdd38d4891';
  const otherUserId = '1d621133-68e6-4a25-bf0a-d8d565350cb8';

  it('lists only the current user entries and applies filters and pagination', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ListFinancialEntriesUseCase(repository);
    await repository.createMany([
      createEntry(userId, 'Mercado', 'FILE', '2026-07'),
      createEntry(userId, 'Farmácia', 'MANUAL', '2026-07'),
      createEntry(userId, 'Posto', 'FILE', '2026-06'),
      createEntry(otherUserId, 'Conta de outro usuário', 'FILE', '2026-07'),
    ]);

    const result = await useCase.execute(userId, {
      mesReferencia: '2026-07',
      origem: 'FILE',
      pagina: 1,
      limite: 1,
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].place).toBe('Mercado');
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('uses the default page and limit', async () => {
    const result = await new ListFinancialEntriesUseCase(
      new FinancialEntryInMemoryRepository(),
    ).execute(userId, {} as never);

    expect(result).toMatchObject({ page: 1, limit: 20, total: 0, totalPages: 0 });
  });
});

function createEntry(
  userId: string,
  place: string,
  origin: 'FILE' | 'MANUAL',
  referenceMonth: string,
): FinancialEntry {
  return FinancialEntry.create({
    userId,
    place,
    amountInCents: 1000n,
    origin,
    sourceFileName: origin === 'FILE' ? 'fatura.csv' : null,
    referenceMonth: new Date(`${referenceMonth}-01T00:00:00.000Z`),
  });
}
