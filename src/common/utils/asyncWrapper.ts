import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';

// Wraps async functions, catching all errors and sending them forward to express error handler
const asyncWrap = (controller: CallableFunction) =>  {
  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default asyncWrap;
