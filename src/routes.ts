import express, { Request, Response, NextFunction } from 'express';
import { UserController } from './controllers/user.controller';
import { provider } from './di.provider';
import requestWrap from './libs/request.wrapper';

const router = express.Router();
const userController = new UserController(provider.userService);

// Bind the methods to preserve 'this' context
router.post('/users', requestWrap(userController.create.bind(userController)));

// Another approach to keep the context
router.get(
  '/users/:id',
  requestWrap((req: Request, res: Response, _next: NextFunction) =>
    userController.get(req, res),
  ),
);

export default router;
