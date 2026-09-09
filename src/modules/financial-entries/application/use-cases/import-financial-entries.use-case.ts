import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { InvalidFinancialEntriesFileError } from '../../domain/errors/financial-entry.errors';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { CsvFinancialEntryParser } from '../services/csv-financial-entry-parser';
import {
  extractReferenceMonthFromFileName,
  parseReferenceMonth,
} from '../services/reference-month';

export interface FinancialEntriesUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

const CSV_MIME_TYPES = new Set(['text/csv', 'application/csv', 'application/vnd.ms-excel']);

export class ImportFinancialEntriesUseCase {
  constructor(
    private readonly repository: FinancialEntryRepository,
    private readonly parser: CsvFinancialEntryParser,
  ) {}

  async execute(
    userId: string,
    file: FinancialEntriesUpload,
    informedReferenceMonth?: string,
  ): Promise<FinancialEntry[]> {
    if (!CSV_MIME_TYPES.has(file.mimetype) || !file.originalname.toLowerCase().endsWith('.csv')) {
      throw new InvalidFinancialEntriesFileError('Only CSV files are supported');
    }

    const referenceMonthValue =
      informedReferenceMonth || extractReferenceMonthFromFileName(file.originalname);
    if (!referenceMonthValue) {
      throw new InvalidFinancialEntriesFileError(
        'Reference month is required when it cannot be identified from the file name',
      );
    }

    const referenceMonth = parseReferenceMonth(referenceMonthValue);
    const parsed = await this.parser.parse(file.buffer);
    if (parsed.length === 0) {
      throw new InvalidFinancialEntriesFileError(
        'The CSV file has no positive financial entries to import',
      );
    }

    const entries = parsed.map((item) =>
      FinancialEntry.create({
        userId,
        place: item.place,
        amountInCents: item.amountInCents,
        origin: 'FILE',
        type: 'SAIDA',
        sourceFileName: file.originalname,
        referenceMonth,
      }),
    );

    return this.repository.createMany(entries);
  }
}
