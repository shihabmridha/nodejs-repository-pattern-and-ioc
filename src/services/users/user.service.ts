import { Application } from 'express';
import { asyncWrap } from '../index';
import * as user from './user.controller';

export default function (app: Application) {
  app.get('/users', asyncWrap(user.getAllUsers));
  app.get('/users/:id', asyncWrap(user.getUserById));
  app.post('/users', asyncWrap(user.createUser));
  app.patch('/users/:id/email', asyncWrap(user.updateEmail));
  app.patch('/users/:id/password', asyncWrap(user.updatePassword));
  app.delete('/users/:id', asyncWrap(user.deleteUser));
}
