import { Application } from 'express';
import asyncWrap from './utils/asyncWrapper';
import UserController from './controllers/user.controller';
import container from './inversify';

/**
 * Configure all the services with the express application
 */
export default function (app: Application) {
  // Iterate over all our controllers and register our routes
  const UserControllerInstance = container.get<UserController>(UserController);

  app.get('/users', asyncWrap(UserControllerInstance.find.bind(UserControllerInstance)));
  app.get('/users/:id', asyncWrap(UserControllerInstance.get.bind(UserControllerInstance)));
  app.post('/users', asyncWrap(UserControllerInstance.create.bind(UserControllerInstance)));
}
