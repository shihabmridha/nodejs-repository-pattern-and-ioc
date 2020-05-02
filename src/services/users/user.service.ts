import { Application } from 'express';
import { getUserRepository } from '../../repositories/user.repository';
import { asyncWrap } from '../index';
import { UserController } from './user.controller';

export default function (app: Application) {
  const user = new UserController(getUserRepository());

  // We can use arrow function as well to bind the context
  app.get('/users', asyncWrap(user.find.bind(user)));
  app.get('/users/:id', asyncWrap(user.get.bind(user)));
  app.post('/users', asyncWrap(user.create.bind(user)));
  app.patch('/users/:id/email', asyncWrap(user.updateEmail.bind(user)));
  app.patch('/users/:id/password', asyncWrap(user.updatePassword.bind(user)));
  app.delete('/users/:id', asyncWrap(user.delete.bind(user)));
}
