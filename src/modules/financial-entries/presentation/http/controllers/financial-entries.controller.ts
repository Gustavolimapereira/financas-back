import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFinancialEntryDto } from '../../../application/dtos/create-financial-entry.dto';
import { UploadFinancialEntriesDto } from '../../../application/dtos/upload-financial-entries.dto';
import { ListFinancialEntriesQueryDto } from '../../../application/dtos/list-financial-entries-query.dto';
import { FinancialSummaryQueryDto } from '../../../application/dtos/financial-summary-query.dto';
import { UpdateFinancialEntryDto } from '../../../application/dtos/update-financial-entry.dto';
import { CreateManualFinancialEntryUseCase } from '../../../application/use-cases/create-manual-financial-entry.use-case';
import { ListFinancialEntriesUseCase } from '../../../application/use-cases/list-financial-entries.use-case';
import { GetFinancialEntryUseCase } from '../../../application/use-cases/get-financial-entry.use-case';
import { UpdateFinancialEntryUseCase } from '../../../application/use-cases/update-financial-entry.use-case';
import { DeleteFinancialEntryUseCase } from '../../../application/use-cases/delete-financial-entry.use-case';
import { GetFinancialSummaryUseCase } from '../../../application/use-cases/get-financial-summary.use-case';
import {
  FinancialEntriesUpload,
  ImportFinancialEntriesUseCase,
} from '../../../application/use-cases/import-financial-entries.use-case';
import { CurrentUser } from '../../../../auth/presentation/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { FinancialEntryPresenter } from '../presenters/financial-entry.presenter';

@ApiTags('financial-entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-entries')
export class FinancialEntriesController {
  constructor(
    private readonly createManualEntry: CreateManualFinancialEntryUseCase,
    private readonly importEntries: ImportFinancialEntriesUseCase,
    private readonly listEntries: ListFinancialEntriesUseCase,
    private readonly getEntry: GetFinancialEntryUseCase,
    private readonly updateEntry: UpdateFinancialEntryUseCase,
    private readonly deleteEntry: DeleteFinancialEntryUseCase,
    private readonly getSummary: GetFinancialSummaryUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List financial entries owned by the authenticated user' })
  async list(@CurrentUser() user: { sub: string }, @Query() query: ListFinancialEntriesQueryDto) {
    const result = await this.listEntries.execute(user.sub, query);
    return {
      items: result.entries.map(FinancialEntryPresenter.toHttp),
      total: result.total,
      pagina: result.page,
      limite: result.limit,
      totalPaginas: result.totalPages,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get income, expense and balance totals for a reference month' })
  async summary(@CurrentUser() user: { sub: string }, @Query() query: FinancialSummaryQueryDto) {
    const result = await this.getSummary.execute(user.sub, query.mesReferencia);
    return {
      mesReferencia: result.referenceMonth,
      totalEntradas: result.totalIncome,
      totalSaidas: result.totalExpense,
      saldo: result.balance,
      quantidadeEntradas: result.incomeCount,
      quantidadeSaidas: result.expenseCount,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one financial entry owned by the authenticated user' })
  async getById(
    @CurrentUser() user: { sub: string },
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return FinancialEntryPresenter.toHttp(await this.getEntry.execute(user.sub, id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a financial entry manually' })
  @ApiCreatedResponse({ description: 'Financial entry created' })
  async createManual(@CurrentUser() user: { sub: string }, @Body() dto: CreateFinancialEntryDto) {
    const entry = await this.createManualEntry.execute(user.sub, dto);
    return FinancialEntryPresenter.toHttp(entry);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial entry owned by the authenticated user' })
  async update(
    @CurrentUser() user: { sub: string },
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateFinancialEntryDto,
  ) {
    return FinancialEntryPresenter.toHttp(await this.updateEntry.execute(user.sub, id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a financial entry owned by the authenticated user' })
  async delete(
    @CurrentUser() user: { sub: string },
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    await this.deleteEntry.execute(user.sub, id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { files: 1, fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        mesReferencia: {
          type: 'string',
          example: '2026-07',
          description: 'Optional when the file name contains a date',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import and aggregate financial entries from a CSV file' })
  @ApiCreatedResponse({ description: 'CSV entries imported' })
  async upload(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadFinancialEntriesDto,
  ) {
    if (!file) throw new BadRequestException('A CSV file is required in the "file" field');

    const entries = await this.importEntries.execute(
      user.sub,
      file as FinancialEntriesUpload,
      dto.mesReferencia,
    );
    return {
      message: 'Arquivo processado e registros inseridos com sucesso',
      arquivo: file.originalname,
      mesReferencia: entries[0].referenceMonth.toISOString().slice(0, 7),
      totalRegistrosInseridos: entries.length,
      valores: entries.map(FinancialEntryPresenter.toHttp),
    };
  }
}
