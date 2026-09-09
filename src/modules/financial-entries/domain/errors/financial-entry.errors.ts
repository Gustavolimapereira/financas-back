export class InvalidFinancialEntryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFinancialEntryError';
  }
}

export class InvalidFinancialEntriesFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFinancialEntriesFileError';
  }
}

export class FinancialEntryNotFoundError extends Error {
  constructor(id: string) {
    super(`Financial entry ${id} was not found`);
    this.name = 'FinancialEntryNotFoundError';
  }
}
