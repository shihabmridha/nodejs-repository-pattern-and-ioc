import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as utils from 'util';

// Promisify some utility functions
export const exists = utils.promisify(fs.exists);
export const mkdir = utils.promisify(fs.mkdir);

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
