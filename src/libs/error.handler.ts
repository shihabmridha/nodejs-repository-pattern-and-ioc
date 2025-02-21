import { Application, Request, Response, NextFunction } from 'express';
import { NotFoundError, ApplicationError } from './app.errors';
import { MongoError } from 'mongodb';
import log from './logger';

export default function (app: Application) {
  // If you are lost
  app.use(() => {
    throw new NotFoundError('You are lost');
  });

  // Request error handler
  app.use(
    (
      error: ApplicationError,
      _req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (error instanceof ApplicationError) {
        log.error(error?.message, error.stack);
        if (error.message) {
          return res.status(error.code).send(error.message);
        } else {
          return res.sendStatus(error.code);
        }
      }

      next(error);
    },
  );

  // Log all errors
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userString = 'unknown user';

    if (err instanceof MongoError) {
      if (err.code === 11000) {
        log.error(
          `${req.method} ${req.path}: MongoDB duplicate entry from ${userString}`,
        );
      } else {
        log.error(
          `${req.method} ${req.path}: Unhandled MongoDB error ${userString}. ${err.errmsg}`,
        );
      }

      if (!res.headersSent) {
        return res.sendStatus(500);
      }
    } else if (err instanceof Error) {
      log.error(
        `${req.method} ${req.path}: Unhandled request error ${userString}. ${err.message}`,
      );
    } else if (typeof err === 'string') {
      log.error(
        `${req.method} ${req.path}: Unhandled request error ${userString}. ${err}`,
      );
    }

    next(err);
  });

  // Optional fallthrough error handler
  app.use(function (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    res.statusCode = 500;
    res.end(err.message + '\n');
  });
}
