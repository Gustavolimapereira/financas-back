import { FinancialEntry } from '../../domain/entities/financial-entry.entity';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { ListFinancialEntriesQueryDto } from '../dtos/list-financial-entries-query.dto';
import { parseReferenceMonth } from '../services/reference-month';

export interface ListFinancialEntriesResult {
  entries: FinancialEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListFinancialEntriesUseCase {
  constructor(private readonly repository: FinancialEntryRepository) {}

  async execute(
    userId: string,
    query: ListFinancialEntriesQueryDto,
  ): Promise<ListFinancialEntriesResult> {
    const page = query.pagina ?? 1;
    const limit = query.limite ?? 20;
    const result = await this.repository.findManyByUser({
      userId,
      referenceMonth: query.mesReferencia ? parseReferenceMonth(query.mesReferencia) : undefined,
      origin: query.origem,
      type: query.tipo,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      entries: result.entries,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
