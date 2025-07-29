import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
}

interface MongooseValidationErrorItem {
  message: string;
}

interface MongooseValidationError {
  errors: Record<string, MongooseValidationErrorItem>;
  name: 'ValidationError';
}

interface MongooseCastError {
  name: 'CastError';
  path: string;
  value: string;
}

interface MongooseDuplicateKeyError {
  code: number;
  keyValue: Record<string, string>;
}

// TODO: Zod error must be specified more

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const env = this.configService.get<string>('NODE_ENV');

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let errorType = 'InternalServerError';
    let errorSources: { path: string; message: string }[] = [];

    // Handle zod error
    if (exception instanceof ZodError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorType = 'ValidationError';
      message = 'Validation failed';
      errorSources = exception.issues.map((err: ZodIssue) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
    }
    // Handle HttpExceptions
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorSources.push({ path: '', message });
      } else if (typeof res === 'object') {
        const resObj = res as HttpExceptionResponse;
        message = resObj.message || message;
        errorType = resObj.error || errorType;

        if (Array.isArray(resObj.message)) {
          errorSources = resObj.message.map((msg: string) => ({
            path: '',
            message: msg,
          }));
        } else {
          errorSources.push({ path: '', message: resObj.message || message });
        }
      }
    }

    // Mongoose: ValidationError
    else if (
      (exception as MongooseValidationError).name === 'ValidationError'
    ) {
      const mongooseErr = exception as MongooseValidationError;
      statusCode = HttpStatus.BAD_REQUEST;
      errorType = 'MongooseValidationError';
      message = 'Validation failed';
      errorSources = Object.entries(mongooseErr.errors).map(
        ([field, errorItem]) => ({
          path: field,
          message: errorItem.message,
        }),
      );
    }

    // Mongoose: CaseError
    else if ((exception as MongooseCastError)?.name === 'CastError') {
      const castErr = exception as MongooseCastError;
      statusCode = HttpStatus.BAD_REQUEST;
      errorType = 'CastError';
      const field = castErr.path || '';
      const value = castErr.value || '';

      message = `Invalid value: '${value}' for field '${field}'`;
      errorSources = [{ path: field, message }];
    }

    // Mongoose: Duplicate key(11000)
    else if ((exception as MongooseDuplicateKeyError)?.code === 11000) {
      const dupErr = exception as MongooseDuplicateKeyError;
      statusCode = HttpStatus.CONFLICT;
      errorType = 'DuplicateKeyError';
      const duplicateField = Object.keys(dupErr.keyValue)[0];
      message = `'${duplicateField}' must be unique.`;
      errorSources = [
        {
          path: duplicateField,
          message,
        },
      ];
    }

    // Generic Error
    else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
      errorSources = [{ path: '', message }];
    }

    const errorResponse = {
      success: false,
      statusCode,
      message,
      error: errorType,
      errorSources,
      path: request.url,
      timestamp: new Date().toISOString(),
      stack: env === 'development' ? (exception as Error).stack : undefined,
    };

    response.status(statusCode).json(errorResponse);
  }
}
