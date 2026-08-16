import { ArgumentsHost, ConflictException, HttpStatus } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { ApiExceptionFilter } from './api-exception.filter';
import { ApiHttpException } from './api-http-exception';

function createHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status, json }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  it('keeps EMAIL_TAKEN on a coded conflict', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new ApiHttpException(
        HttpStatus.CONFLICT,
        API_ERROR_CODES.EMAIL_TAKEN,
        'Email is already registered',
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      code: API_ERROR_CODES.EMAIL_TAKEN,
      message: 'Email is already registered',
    });
  });

  it('does not invent EMAIL_TAKEN for a generic ConflictException', () => {
    const { host, json } = createHost();

    filter.catch(new ConflictException('Email is already registered'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: API_ERROR_CODES.UNKNOWN,
      }),
    );
  });
});
