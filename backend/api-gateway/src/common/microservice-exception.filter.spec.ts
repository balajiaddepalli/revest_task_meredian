import { MicroserviceExceptionFilter } from './microservice-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('MicroserviceExceptionFilter', () => {
  const filter = new MicroserviceExceptionFilter();
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
  });

  const createHost = () =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
      }),
    }) as unknown as ArgumentsHost;

  it('passes through HttpException', () => {
    filter.catch(new HttpException('Forbidden', HttpStatus.FORBIDDEN), createHost());
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, message: 'Forbidden' }),
    );
  });

  it('maps microservice NotFoundException payload to 404', () => {
    filter.catch(
      {
        status: 'error',
        message: {
          statusCode: 404,
          message: 'Product with id abc not found',
          error: 'Not Found',
        },
      },
      createHost(),
    );
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Product with id abc not found',
      error: 'Not Found',
    });
  });

  it('returns 500 for unknown errors', () => {
    filter.catch(new Error('Unexpected'), createHost());
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Unexpected',
    });
  });
});
