import { Application } from 'express';
import { injectable, inject } from 'inversify';
import asyncWrap from './common/utils/asyncWrapper';
import UserController from './user/user.controller';
import { TYPES } from './types';

@injectable()
export default class ApplicationRouter {
  @inject(TYPES.UserController) private userController: UserController;

  public register(app: Application) {
    app.get('/users', asyncWrap(this.userController.find));
    app.get('/users/:id', asyncWrap(this.userController.get));
    app.post('/users', asyncWrap(this.userController.create));
  }
}
