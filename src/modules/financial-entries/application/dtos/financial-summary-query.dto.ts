import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class FinancialSummaryQueryDto {
  @ApiProperty({ example: '2026-07' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mesReferencia must use the YYYY-MM format',
  })
  mesReferencia!: string;
}
