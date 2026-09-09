import { FinancialEntryInMemoryRepository } from '../../infrastructure/database/in-memory/financial-entry-in-memory.repository';
import { CreateManualFinancialEntryUseCase } from './create-manual-financial-entry.use-case';

describe('CreateManualFinancialEntryUseCase', () => {
  it('creates a manual financial entry', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new CreateManualFinancialEntryUseCase(repository);

    const entry = await useCase.execute('467783ef-5b38-4cf4-a130-cabdd38d4891', {
      lugar: 'Auto Posto Cinco Skina',
      valor: 80,
      mesReferencia: '2026-07',
    });

    expect(entry.amount).toBe('80.00');
    expect(entry.origin).toBe('MANUAL');
    expect(entry.type).toBe('SAIDA');
    expect(entry.sourceFileName).toBeNull();
    expect(entry.referenceMonth.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(entry.createdAt).toBeInstanceOf(Date);
    expect(repository.entries).toHaveLength(1);
  });
});
