import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class UploadFinancialEntriesDto {
  @ApiPropertyOptional({
    example: '2026-07',
    description:
      'Reference month in YYYY-MM format. It can be omitted when the file name contains a date.',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mesReferencia must use the YYYY-MM format',
  })
  mesReferencia?: string;
}
