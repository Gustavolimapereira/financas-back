import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry.errors';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';

export class GetFinancialEntryUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  async execute(userId: string, id: string): Promise<FinancialEntry> {
    const entry = await this.repository.findByIdAndUser(id, userId);
    if (!entry) throw new FinancialEntryNotFoundError(id);
    return entry;
  }
}
