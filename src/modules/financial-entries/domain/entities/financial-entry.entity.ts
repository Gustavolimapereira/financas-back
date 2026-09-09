import { randomUUID } from 'crypto';
import { InvalidFinancialEntryError } from '../errors/financial-entry.errors';

export type FinancialEntryOrigin = 'FILE' | 'MANUAL';
export type FinancialEntryType = 'ENTRADA' | 'SAIDA';

export class FinancialEntry {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly place: string,
    public readonly amountInCents: bigint,
    public readonly origin: FinancialEntryOrigin,
    public readonly type: FinancialEntryType,
    public readonly sourceFileName: string | null,
    public readonly referenceMonth: Date,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string;
    place: string;
    amountInCents: bigint;
    origin: FinancialEntryOrigin;
    type?: FinancialEntryType;
    referenceMonth: Date;
    sourceFileName?: string | null;
    id?: string;
    createdAt?: Date;
  }): FinancialEntry {
    const place = props.place.trim();

    if (!place || place.length > 255) {
      throw new InvalidFinancialEntryError('Place must have between 1 and 255 characters');
    }

    if (props.amountInCents === 0n) {
      throw new InvalidFinancialEntryError('Amount must be different from zero');
    }

    if (props.amountInCents > 99_999_999_999_999n || props.amountInCents < -99_999_999_999_999n) {
      throw new InvalidFinancialEntryError('Amount is outside the supported range');
    }

    const sourceFileName = props.sourceFileName?.trim() || null;
    if (props.origin === 'FILE' && !sourceFileName) {
      throw new InvalidFinancialEntryError('File entries must include the source file name');
    }

    if (
      Number.isNaN(props.referenceMonth.getTime()) ||
      props.referenceMonth.getUTCDate() !== 1 ||
      props.referenceMonth.getUTCHours() !== 0
    ) {
      throw new InvalidFinancialEntryError('Reference month must be the first day of a month');
    }

    return new FinancialEntry(
      props.id ?? randomUUID(),
      props.userId,
      place,
      props.amountInCents,
      props.origin,
      props.type ?? 'SAIDA',
      sourceFileName,
      props.referenceMonth,
      props.createdAt ?? new Date(),
    );
  }

  get amount(): string {
    const negative = this.amountInCents < 0n;
    const absolute = negative ? -this.amountInCents : this.amountInCents;
    const integer = absolute / 100n;
    const decimals = (absolute % 100n).toString().padStart(2, '0');
    return `${negative ? '-' : ''}${integer}.${decimals}`;
  }
}
