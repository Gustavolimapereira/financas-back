import { FinancialEntryInMemoryRepository } from '../../infrastructure/database/in-memory/financial-entry-in-memory.repository';
import { InvalidFinancialEntriesFileError } from '../../domain/errors/financial-entry.errors';
import { CsvFinancialEntryParser } from '../services/csv-financial-entry-parser';
import { ImportFinancialEntriesUseCase } from './import-financial-entries.use-case';

describe('ImportFinancialEntriesUseCase', () => {
  const userId = '467783ef-5b38-4cf4-a130-cabdd38d4891';

  it('aggregates equal titles and marks entries as imported from a file', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ImportFinancialEntriesUseCase(repository, new CsvFinancialEntryParser());

    const entries = await useCase.execute(userId, {
      originalname: 'Nubank_2026-07-28.csv',
      mimetype: 'text/csv',
      buffer: Buffer.from(
        'title,amount\nPty*Rlx Drogarias,"9,99"\nPty*Rlx Drogarias,"19,98"\n9 de Julho,21.70\n',
      ),
    });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      place: 'Pty*Rlx Drogarias',
      origin: 'FILE',
      type: 'SAIDA',
      sourceFileName: 'Nubank_2026-07-28.csv',
    });
    expect(entries[0].amount).toBe('29.97');
    expect(entries[0].referenceMonth.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(entries[1].amount).toBe('21.70');
    expect(repository.entries).toHaveLength(2);
  });

  it('accepts semicolon-separated CSV files with Brazilian amounts', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ImportFinancialEntriesUseCase(repository, new CsvFinancialEntryParser());

    const [entry] = await useCase.execute(
      userId,
      {
        originalname: 'fatura.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from('title;amount\nSpani Atacadista;311,81\n'),
      },
      '2026-06',
    );

    expect(entry.amount).toBe('311.81');
    expect(entry.referenceMonth.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });

  it('ignores negative amounts instead of persisting or aggregating them', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ImportFinancialEntriesUseCase(repository, new CsvFinancialEntryParser());

    const entries = await useCase.execute(
      userId,
      {
        originalname: 'fatura.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from(
          'title;amount\nEstorno de compra;- 22,02\nPagamento recebido;- 2.330,48\nMercado;100,00\nMercado;- 10,00\n',
        ),
      },
      '2026-08',
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ place: 'Mercado', amount: '100.00' });
    expect(repository.entries).toHaveLength(1);
  });

  it('rejects a CSV that contains no positive financial entries', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ImportFinancialEntriesUseCase(repository, new CsvFinancialEntryParser());

    await expect(
      useCase.execute(
        userId,
        {
          originalname: 'fatura.csv',
          mimetype: 'text/csv',
          buffer: Buffer.from(
            'title;amount\nEstorno de compra;- 22,02\nPagamento recebido;- 2.330,48\n',
          ),
        },
        '2026-08',
      ),
    ).rejects.toThrow('The CSV file has no positive financial entries to import');
    expect(repository.entries).toHaveLength(0);
  });

  it('does not persist any entry when a row is invalid', async () => {
    const repository = new FinancialEntryInMemoryRepository();
    const useCase = new ImportFinancialEntriesUseCase(repository, new CsvFinancialEntryParser());

    await expect(
      useCase.execute(userId, {
        originalname: 'fatura_2026-07.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from('title,amount\nMercado,10.00\nPosto,valor-invalido\n'),
      }),
    ).rejects.toThrow(InvalidFinancialEntriesFileError);
    expect(repository.entries).toHaveLength(0);
  });

  it('rejects non-CSV files', async () => {
    const useCase = new ImportFinancialEntriesUseCase(
      new FinancialEntryInMemoryRepository(),
      new CsvFinancialEntryParser(),
    );

    await expect(
      useCase.execute(userId, {
        originalname: 'fatura.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('title,amount\nMercado,10.00\n'),
      }),
    ).rejects.toThrow(InvalidFinancialEntriesFileError);
  });

  it('requires an explicit reference month when the file name has no date', async () => {
    const useCase = new ImportFinancialEntriesUseCase(
      new FinancialEntryInMemoryRepository(),
      new CsvFinancialEntryParser(),
    );

    await expect(
      useCase.execute(userId, {
        originalname: 'fatura.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from('title,amount\nMercado,10.00\n'),
      }),
    ).rejects.toThrow(InvalidFinancialEntriesFileError);
  });
});
