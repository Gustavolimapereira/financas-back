import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma/prisma.service';
import { FinancialEntry } from '../../../../domain/entities/financial-entry.entity';
import {
  FinancialEntryRepository,
  FinancialEntriesSummary,
  FindFinancialEntriesByUserParams,
} from '../../../../domain/repositories/financial-entry.repository';
import { FinancialEntry as PrismaFinancialEntry } from '@prisma/client';

@Injectable()
export class FinancialEntryPrismaRepository implements FinancialEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entry: FinancialEntry): Promise<FinancialEntry> {
    await this.prisma.financialEntry.create({ data: this.toPersistence(entry) });
    return entry;
  }

  async createMany(entries: FinancialEntry[]): Promise<FinancialEntry[]> {
    await this.prisma.financialEntry.createMany({
      data: entries.map((entry) => this.toPersistence(entry)),
    });
    return entries;
  }

  async findByIdAndUser(id: string, userId: string): Promise<FinancialEntry | null> {
    const record = await this.prisma.financialEntry.findFirst({ where: { id, userId } });
    return record ? this.toDomain(record) : null;
  }

  async findManyByUser(
    params: FindFinancialEntriesByUserParams,
  ): Promise<{ entries: FinancialEntry[]; total: number }> {
    const where = {
      userId: params.userId,
      referenceMonth: params.referenceMonth,
      origin: params.origin,
      type: params.type,
    };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.financialEntry.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.financialEntry.count({ where }),
    ]);

    return {
      entries: records.map((record) => this.toDomain(record)),
      total,
    };
  }

  async save(entry: FinancialEntry): Promise<FinancialEntry> {
    await this.prisma.financialEntry.update({
      where: { id: entry.id },
      data: this.toPersistence(entry),
    });
    return entry;
  }

  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.financialEntry.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async summarizeByMonth(userId: string, referenceMonth: Date): Promise<FinancialEntriesSummary> {
    const groups = await this.prisma.financialEntry.groupBy({
      by: ['type'],
      where: { userId, referenceMonth },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const summary: FinancialEntriesSummary = {
      totalIncomeInCents: 0n,
      totalExpenseInCents: 0n,
      incomeCount: 0,
      expenseCount: 0,
    };
    for (const group of groups) {
      const amountInCents = BigInt((group._sum.amount?.mul(100) ?? 0).toFixed(0));
      if (group.type === 'ENTRADA') {
        summary.totalIncomeInCents = amountInCents;
        summary.incomeCount = group._count._all;
      } else {
        summary.totalExpenseInCents = amountInCents;
        summary.expenseCount = group._count._all;
      }
    }
    return summary;
  }

  private toPersistence(entry: FinancialEntry) {
    return {
      id: entry.id,
      userId: entry.userId,
      place: entry.place,
      amount: entry.amount,
      origin: entry.origin,
      type: entry.type,
      sourceFileName: entry.sourceFileName,
      referenceMonth: entry.referenceMonth,
      createdAt: entry.createdAt,
    };
  }

  private toDomain(record: PrismaFinancialEntry): FinancialEntry {
    return FinancialEntry.create({
      id: record.id,
      userId: record.userId,
      place: record.place,
      amountInCents: BigInt(record.amount.mul(100).toFixed(0)),
      origin: record.origin,
      type: record.type,
      sourceFileName: record.sourceFileName,
      referenceMonth: record.referenceMonth,
      createdAt: record.createdAt,
    });
  }
}
