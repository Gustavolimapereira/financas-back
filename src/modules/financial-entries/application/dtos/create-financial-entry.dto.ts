import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialEntryType } from '../../domain/entities/financial-entry.entity';

export class CreateFinancialEntryDto {
  @ApiProperty({ example: 'Spani Atacadista' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lugar!: string;

  @ApiProperty({ example: 311.81 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowInfinity: false, allowNaN: false })
  valor!: number;

  @ApiProperty({ example: '2026-07', description: 'Reference month in YYYY-MM format' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mesReferencia must use the YYYY-MM format',
  })
  mesReferencia!: string;

  @ApiPropertyOptional({ enum: ['ENTRADA', 'SAIDA'], default: 'SAIDA' })
  @IsOptional()
  @IsEnum({ ENTRADA: 'ENTRADA', SAIDA: 'SAIDA' })
  tipo?: FinancialEntryType;
}
