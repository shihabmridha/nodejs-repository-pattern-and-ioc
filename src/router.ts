import { Application } from 'express';
import { injectable, inject } from 'inversify';
import asyncWrap from './core/asyncWrapper';
import UserController from './user/user.controller';
import TYPES from './types';
import BaseController from './common/base.controller';

@injectable()
export default class ApplicationRouter {
  @inject(TYPES.UserController) private userController: UserController;

  // We need to bind proper context to the controller methods
  private getController(context: BaseController, func: string) {
    return asyncWrap(context[func].bind(context));
  }

  public register(app: Application) {
    app.get('/users', this.getController(this.userController, 'getAll'));
    app.get('/users/:id', this.getController(this.userController, 'get'));
    app.post('/users', this.getController(this.userController, 'create'));
  }
}
