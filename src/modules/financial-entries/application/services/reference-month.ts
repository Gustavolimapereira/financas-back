import { InvalidFinancialEntryError } from '../../domain/errors/financial-entry.errors';

const REFERENCE_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function parseReferenceMonth(value: string): Date {
  const match = REFERENCE_MONTH_PATTERN.exec(value);
  if (!match) {
    throw new InvalidFinancialEntryError('Reference month must use the YYYY-MM format');
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

export function extractReferenceMonthFromFileName(fileName: string): string | null {
  const match = /(?:^|\D)((?:19|20)\d{2})[-_](0[1-9]|1[0-2])(?:[-_]\d{2})?(?:\D|$)/.exec(fileName);
  return match ? `${match[1]}-${match[2]}` : null;
}
