import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class RpcHttpExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const payload = typeof response === 'string'
        ? { statusCode: exception.getStatus(), message: response }
        : response;
      return throwError(() => new RpcException(payload));
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    return throwError(() =>
      new RpcException({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message }),
    );
  }
}
