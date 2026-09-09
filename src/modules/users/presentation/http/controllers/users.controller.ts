import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';
import { UpdateCurrentUserUseCase } from '../../../application/use-cases/update-current-user.use-case';
import { JwtAuthGuard } from '../../../../auth/presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/presentation/http/guards/roles.guard';
import { Roles } from '../../../../auth/presentation/http/decorators/roles.decorator';
import { CurrentUser } from '../../../../auth/presentation/http/decorators/current-user.decorator';
import { CreateUserDto } from '../../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../../application/dtos/update-user.dto';
import { UserPresenter } from '../presenters/user.presenter';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateCurrentUserUseCase: UpdateCurrentUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return UserPresenter.toHttp(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: { sub: string }) {
    const currentUser = await this.getCurrentUserUseCase.execute(user.sub);
    return UserPresenter.toHttp(currentUser);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user' })
  async updateMe(@CurrentUser() user: { sub: string }, @Body() body: UpdateUserDto) {
    const updated = await this.updateCurrentUserUseCase.execute(user.sub, body);
    return UserPresenter.toHttp(updated);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by id' })
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const user = await this.getUserByIdUseCase.execute(id);
    return UserPresenter.toHttp(user);
  }
}
