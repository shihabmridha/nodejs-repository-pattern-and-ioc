import { Application, Request, Response, NextFunction } from 'express';
import userService from './users/user.service';

/**
 * Configure all the services with the express application
 */
export default function (app: Application) {
  userService(app);
}

// Wraps async functions, catching all errors and sending them forward to express error handler
export function asyncWrap(controller: CallableFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
