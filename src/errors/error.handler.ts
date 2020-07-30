import { Application, Request, Response, NextFunction } from 'express';
import { NotFoundError, ApplicationError } from './app.errors';
import { MongoError } from 'mongodb';
import log from '../logger';

export default function (app: Application) {

  /**
   * Handle errors
   */

  // If you are lost
  app.use(() => {
    throw new NotFoundError('You are lost');
  });

  // Request error handler
  app.use((err: ApplicationError, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApplicationError) {
      if (err.message) {
        log.info(err.message);
        res.status(err.code).send(err.message);
      } else {
        res.sendStatus(err.code);
      }

      return;
    }

    next(err);
  });

  // Log all errors
  app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    const userString = 'unknown user';

    if (err instanceof MongoError) {
      if (err.code === 11000) {
        log.error(`${req.method} ${req.path}: MongoDB duplicate entry from ${userString}`);
      } else {
        log.error(`${req.method} ${req.path}: Unhandled MongoDB error ${userString}. ${err.errmsg}`);
      }

      if (!res.headersSent) {
        return res.sendStatus(500);
      }

    } else if (err instanceof Error) {
      log.error(`${req.method} ${req.path}: Unhandled request error ${userString}. ${err.message}`);
    } else if (typeof err === 'string') {
      log.error(`${req.method} ${req.path}: Unhandled request error ${userString}. ${err}`);
    }

    next(err);
  });

  // Optional fallthrough error handler
  app.use(function onError(err: Error, _req: Request, res: Response, _next: NextFunction) {
    res.statusCode = 500;
    res.end(err.message + '\n');
  });
}
