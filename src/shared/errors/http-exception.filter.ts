import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  InvalidUserDataError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../modules/users/domain/errors/user.errors';
import {
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InactiveUserError,
  UnauthorizedError,
} from '../../modules/auth/domain/errors/auth.errors';
import {
  FinancialEntryNotFoundError,
  InvalidFinancialEntriesFileError,
  InvalidFinancialEntryError,
} from '../../modules/financial-entries/domain/errors/financial-entry.errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        message,
        path: request.url,
      });
      return;
    }

    if (
      exception instanceof UserAlreadyExistsError ||
      exception instanceof UserNotFoundError ||
      exception instanceof InvalidUserDataError ||
      exception instanceof InvalidCredentialsError ||
      exception instanceof InactiveUserError ||
      exception instanceof InvalidRefreshTokenError ||
      exception instanceof ExpiredRefreshTokenError ||
      exception instanceof UnauthorizedError ||
      exception instanceof InvalidFinancialEntryError ||
      exception instanceof InvalidFinancialEntriesFileError ||
      exception instanceof FinancialEntryNotFoundError
    ) {
      const status = this.mapErrorToStatus(exception);
      response.status(status).json({
        statusCode: status,
        message: exception.message,
        path: request.url,
      });
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: request.url,
    });
  }

  private mapErrorToStatus(exception: Error): HttpStatus {
    if (exception instanceof UserAlreadyExistsError) return HttpStatus.CONFLICT;
    if (exception instanceof UserNotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof FinancialEntryNotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof InvalidUserDataError) return HttpStatus.BAD_REQUEST;
    if (exception instanceof InvalidCredentialsError || exception instanceof InactiveUserError)
      return HttpStatus.UNAUTHORIZED;
    if (
      exception instanceof InvalidRefreshTokenError ||
      exception instanceof ExpiredRefreshTokenError
    )
      return HttpStatus.UNAUTHORIZED;
    if (exception instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    return HttpStatus.BAD_REQUEST;
  }
}
