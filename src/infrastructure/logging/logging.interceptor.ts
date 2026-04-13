import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorWithStatus } from './logging.types';
import { RequestWithRequestId } from './request-id.middleware';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithRequestId>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const durationMs =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        this.logger.log(
          JSON.stringify({
            type: 'http',
            requestId: request.requestId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs: Number(durationMs.toFixed(0)),
          }),
        );
      }),
      catchError((error: unknown) => {
        const durationMs =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const typedError = error as ErrorWithStatus;

        this.logger.error(
          JSON.stringify({
            type: 'http',
            requestId: request.requestId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: typedError.status ?? 500,
            durationMs: Number(durationMs.toFixed(0)),
            error: {
              name: error instanceof Error ? error.name : 'UnknownError',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          }),
        );

        return throwError(() => error);
      }),
    );
  }
}
