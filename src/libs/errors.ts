import Constants from '../constants';

export abstract class HttpError extends Error {
  public code: number | null = null;

  constructor(code: number, message?: string, ...args: any) {
    super(...args);
    this.code = code;
    this.message = message ?? '';
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string, ...args: any) {
    super(400, message, ...args);
  }
}

export class Unauthorized extends HttpError {
  constructor(message?: string) {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message?: string, ...args: any) {
    super(403, message, args);
  }
}

export class NotFound extends HttpError {
  constructor(message?: string, ...args: any) {
    super(404, message, args);
  }
}

export class ValidationError extends HttpError {
  constructor(message?: string, ...args: any) {
    super(422, message, args);
  }
}
