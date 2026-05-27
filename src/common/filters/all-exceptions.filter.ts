import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' ? res : { message: res };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const error = exception as any;
      // P2002 = Unique constraint violation
      if (error.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const fields = (error.meta?.target as string[])?.join(', ');
        message = { message: `Duplicate value for: ${fields}` };
      }
      // P2025 = Record not found
      else if (error.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = { message: 'Record not found' };
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
