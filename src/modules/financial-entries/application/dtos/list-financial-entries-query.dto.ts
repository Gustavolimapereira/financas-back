import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  FinancialEntryOrigin,
  FinancialEntryType,
} from '../../domain/entities/financial-entry.entity';

export class ListFinancialEntriesQueryDto {
  @ApiPropertyOptional({ example: '2026-07' })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mesReferencia must use the YYYY-MM format',
  })
  mesReferencia?: string;

  @ApiPropertyOptional({ enum: ['FILE', 'MANUAL'] })
  @IsOptional()
  @IsEnum({ FILE: 'FILE', MANUAL: 'MANUAL' })
  origem?: FinancialEntryOrigin;

  @ApiPropertyOptional({ enum: ['ENTRADA', 'SAIDA'] })
  @IsOptional()
  @IsEnum({ ENTRADA: 'ENTRADA', SAIDA: 'SAIDA' })
  tipo?: FinancialEntryType;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite: number = 20;
}
