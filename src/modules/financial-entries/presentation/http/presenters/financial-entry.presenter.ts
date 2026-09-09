import { FinancialEntry } from '../../../domain/entities/financial-entry.entity';

export class FinancialEntryPresenter {
  static toHttp(entry: FinancialEntry) {
    return {
      id: entry.id,
      lugar: entry.place,
      valor: entry.amount,
      origem: entry.origin,
      tipo: entry.type,
      nomeArquivo: entry.sourceFileName,
      mesReferencia: entry.referenceMonth.toISOString().slice(0, 7),
      inseridoEm: entry.createdAt.toISOString(),
    };
  }
}
