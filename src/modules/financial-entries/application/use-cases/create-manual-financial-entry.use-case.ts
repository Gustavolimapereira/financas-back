import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { CreateFinancialEntryDto } from '../dtos/create-financial-entry.dto';
import { parseMoneyToCents } from '../services/money-parser';
import { parseReferenceMonth } from '../services/reference-month';

export class CreateManualFinancialEntryUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  execute(userId: string, dto: CreateFinancialEntryDto): Promise<FinancialEntry> {
    return this.repository.create(
      FinancialEntry.create({
        userId,
        place: dto.lugar,
        amountInCents: parseMoneyToCents(dto.valor),
        origin: 'MANUAL',
        type: dto.tipo ?? 'SAIDA',
        referenceMonth: parseReferenceMonth(dto.mesReferencia),
      }),
    );
  }
}
