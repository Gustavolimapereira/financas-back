import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { InvalidFinancialEntriesFileError } from '../../domain/errors/financial-entry.errors';
import { parseMoneyToCents } from './money-parser';

interface ParsedCsvEntry {
  place: string;
  amountInCents: bigint;
}

export class CsvFinancialEntryParser {
  async parse(contents: Buffer): Promise<ParsedCsvEntry[]> {
    const separator = this.detectSeparator(contents);
    const rows = Readable.from(contents).pipe(
      csvParser({
        separator,
        strict: true,
        mapHeaders: ({ header }) =>
          header
            .replace(/^\uFEFF/, '')
            .trim()
            .toLowerCase(),
      }),
    );
    const totals = new Map<string, bigint>();
    let rowNumber = 1;

    try {
      for await (const row of rows) {
        rowNumber += 1;
        const values = row as Record<string, unknown>;
        const title = typeof values.title === 'string' ? values.title.trim() : '';
        const amount = typeof values.amount === 'string' ? values.amount.trim() : '';

        if (!title || !amount) {
          throw new InvalidFinancialEntriesFileError(
            `Invalid CSV row ${rowNumber}: title and amount are required`,
          );
        }

        let amountInCents: bigint;
        try {
          amountInCents = parseMoneyToCents(amount);
        } catch {
          throw new InvalidFinancialEntriesFileError(
            `Invalid CSV row ${rowNumber}: amount "${amount}" is invalid`,
          );
        }

        if (amountInCents < 0n) continue;

        totals.set(title, (totals.get(title) ?? 0n) + amountInCents);
      }
    } catch (error) {
      if (error instanceof InvalidFinancialEntriesFileError) throw error;
      throw new InvalidFinancialEntriesFileError('The CSV file could not be parsed');
    }

    if (rowNumber === 1) {
      throw new InvalidFinancialEntriesFileError('The CSV file has no data rows');
    }

    return Array.from(totals, ([place, amountInCents]) => ({ place, amountInCents }));
  }

  private detectSeparator(contents: Buffer): ',' | ';' {
    const firstLine = contents
      .toString('utf8')
      .split(/\r?\n/, 1)[0]
      .replace(/^\uFEFF/, '');
    return firstLine.includes(';') ? ';' : ',';
  }
}
