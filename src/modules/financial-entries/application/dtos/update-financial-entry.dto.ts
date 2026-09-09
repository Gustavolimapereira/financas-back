import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { FinancialEntryType } from '../../domain/entities/financial-entry.entity';

export class UpdateFinancialEntryDto {
  @ApiPropertyOptional({ example: 'Conta de energia' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lugar?: string;

  @ApiPropertyOptional({ example: 185.9 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  valor?: number;

  @ApiPropertyOptional({ example: '2026-07' })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mesReferencia must use the YYYY-MM format',
  })
  mesReferencia?: string;

  @ApiPropertyOptional({ enum: ['ENTRADA', 'SAIDA'] })
  @IsOptional()
  @IsEnum({ ENTRADA: 'ENTRADA', SAIDA: 'SAIDA' })
  tipo?: FinancialEntryType;
}
