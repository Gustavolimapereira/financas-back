import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import {
  FinancialEntryNotFoundError,
  InvalidFinancialEntryError,
} from '../../domain/errors/financial-entry.errors';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { UpdateFinancialEntryDto } from '../dtos/update-financial-entry.dto';
import { parseMoneyToCents } from '../services/money-parser';
import { parseReferenceMonth } from '../services/reference-month';

export class UpdateFinancialEntryUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  async execute(userId: string, id: string, dto: UpdateFinancialEntryDto): Promise<FinancialEntry> {
    const current = await this.repository.findByIdAndUser(id, userId);
    if (!current) throw new FinancialEntryNotFoundError(id);

    if (
      dto.lugar === undefined &&
      dto.valor === undefined &&
      dto.mesReferencia === undefined &&
      dto.tipo === undefined
    ) {
      throw new InvalidFinancialEntryError('At least one field must be provided');
    }

    const updated = FinancialEntry.create({
      id: current.id,
      userId: current.userId,
      place: dto.lugar ?? current.place,
      amountInCents: dto.valor === undefined ? current.amountInCents : parseMoneyToCents(dto.valor),
      origin: current.origin,
      type: dto.tipo ?? current.type,
      sourceFileName: current.sourceFileName,
      referenceMonth: dto.mesReferencia
        ? parseReferenceMonth(dto.mesReferencia)
        : current.referenceMonth,
      createdAt: current.createdAt,
    });

    return this.repository.save(updated);
  }
}
