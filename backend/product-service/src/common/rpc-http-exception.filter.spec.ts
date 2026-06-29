import { NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcHttpExceptionFilter } from './rpc-http-exception.filter';

describe('RpcHttpExceptionFilter', () => {
  const filter = new RpcHttpExceptionFilter();

  it('serializes HttpException as RpcException payload', (done) => {
    filter.catch(new NotFoundException('Product not found'), {} as never).subscribe({
      error: (err: RpcException) => {
        expect(err.getError()).toEqual(
          expect.objectContaining({ statusCode: 404, message: 'Product not found' }),
        );
        done();
      },
    });
  });

  it('serializes unknown errors as 500 RpcException', (done) => {
    filter.catch(new Error('Database down'), {} as never).subscribe({
      error: (err: RpcException) => {
        expect(err.getError()).toEqual(
          expect.objectContaining({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Database down' }),
        );
        done();
      },
    });
  });

  it('serializes BadRequestException', (done) => {
    filter.catch(new BadRequestException('Invalid input'), {} as never).subscribe({
      error: (err: RpcException) => {
        expect(err.getError()).toEqual(
          expect.objectContaining({ statusCode: 400, message: 'Invalid input' }),
        );
        done();
      },
    });
  });
});
