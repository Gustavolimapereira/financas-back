import { InvalidFinancialEntryError } from '../../domain/errors/financial-entry.errors';

export function parseMoneyToCents(value: string | number): bigint {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new InvalidFinancialEntryError('Invalid amount');
    }
    value = value.toFixed(2);
  }

  let normalized = value.trim().replace(/\s/g, '').replace(/R\$/gi, '');
  if (!normalized || !/^[+-]?[\d.,]+$/.test(normalized)) {
    throw new InvalidFinancialEntryError(`Invalid amount: ${value}`);
  }

  const sign = normalized.startsWith('-') ? -1n : 1n;
  normalized = normalized.replace(/^[+-]/, '');

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  let decimalSeparator = '';

  if (lastComma >= 0 && lastDot >= 0) {
    decimalSeparator = lastComma > lastDot ? ',' : '.';
  } else if (lastComma >= 0) {
    decimalSeparator = ',';
  } else if (lastDot >= 0) {
    decimalSeparator = '.';
  }

  let integerPart = normalized;
  let decimalPart = '';
  if (decimalSeparator) {
    const separatorIndex = normalized.lastIndexOf(decimalSeparator);
    integerPart = normalized.slice(0, separatorIndex);
    decimalPart = normalized.slice(separatorIndex + 1);
  }

  integerPart = integerPart.replace(/[.,]/g, '');
  if (!integerPart || !/^\d+$/.test(integerPart) || !/^\d*$/.test(decimalPart)) {
    throw new InvalidFinancialEntryError(`Invalid amount: ${value}`);
  }
  if (decimalPart.length > 2) {
    throw new InvalidFinancialEntryError(`Amount must have at most two decimal places: ${value}`);
  }

  return sign * (BigInt(integerPart) * 100n + BigInt(decimalPart.padEnd(2, '0') || '0'));
}
