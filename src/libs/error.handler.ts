import { Application, Request, Response, NextFunction } from 'express';
import { NotFoundError, ApplicationError } from './app.errors';
import { MongoError } from 'mongodb';
import log from './logger';

export default function (app: Application) {
  // If you are lost
  app.use(() => {
    throw new NotFoundError('You are lost');
  });

  // Log all errors
  app.use(function (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    if (error instanceof ApplicationError) {
      log.error(error?.message, error.stack);
      if (error.message) {
        res.status(error.code ?? 400).send(error.message);
        return;
      } else {
        res.sendStatus(error.code ?? 500);
        return;
      }
    }

    const userString = 'unknown user';

    if (error instanceof MongoError) {
      if (error.code === 11000) {
        log.error(
          `${req.method} ${req.path}: MongoDB duplicate entry from ${userString}`,
        );
      } else {
        log.error(
          `${req.method} ${req.path}: Unhandled MongoDB error ${userString}. ${error.errmsg}`,
        );
      }

      if (!res.headersSent) {
        res.sendStatus(500);
        return;
      }
    } else if (error instanceof Error) {
      log.error(
        `${req.method} ${req.path}: Unhandled request error ${userString}. ${error.message}`,
      );
    } else if (typeof error === 'string') {
      log.error(
        `${req.method} ${req.path}: Unhandled request error ${userString}. ${error}`,
      );
    }

    res.status(500).send(error.message + '\n');
  });
}
