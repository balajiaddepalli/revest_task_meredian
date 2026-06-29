import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

function extractRpcError(exception: unknown): { statusCode: number; message: string; error?: string } | null {
  if (!exception || typeof exception !== 'object') return null;

  const err = exception as Record<string, unknown>;
  const candidates = [err.message, err.error, err];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const payload = candidate as Record<string, unknown>;
    if (typeof payload.statusCode === 'number') {
      const message = payload.message;
      return {
        statusCode: payload.statusCode,
        message: Array.isArray(message) ? message.join(', ') : String(message ?? 'Error'),
        error: typeof payload.error === 'string' ? payload.error : undefined,
      };
    }
  }

  if (err.status === 'error' && err.message && typeof err.message === 'object') {
    return extractRpcError({ message: err.message });
  }

  return null;
}

@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
      return;
    }

    const rpcError = extractRpcError(exception);
    if (rpcError) {
      response.status(rpcError.statusCode).json({
        statusCode: rpcError.statusCode,
        message: rpcError.message,
        ...(rpcError.error ? { error: rpcError.error } : {}),
      });
      return;
    }

    if (exception && typeof exception === 'object') {
      const err = exception as Record<string, unknown>;
      const nested = err.response ?? err.responseBody;
      const nestedError = extractRpcError(nested);
      if (nestedError) {
        response.status(nestedError.statusCode).json({
          statusCode: nestedError.statusCode,
          message: nestedError.message,
          ...(nestedError.error ? { error: nestedError.error } : {}),
        });
        return;
      }

      const statusCode = typeof err.statusCode === 'number' ? err.statusCode : undefined;
      if (statusCode && statusCode >= 400 && statusCode < 600) {
        const message = err.message;
        response.status(statusCode).json({
          statusCode,
          message: Array.isArray(message) ? message.join(', ') : String(message ?? 'Error'),
          ...(typeof err.error === 'string' ? { error: err.error } : {}),
        });
        return;
      }
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
