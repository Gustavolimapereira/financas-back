import { FinancialEntryNotFoundError } from '../../domain/errors/financial-entry.errors';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';

export class DeleteFinancialEntryUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdAndUser(id, userId);
    if (!deleted) throw new FinancialEntryNotFoundError(id);
  }
}
