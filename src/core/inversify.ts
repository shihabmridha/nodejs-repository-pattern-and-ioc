import { Container } from 'inversify';
import TYPES from '../types';
import UserRepository from '../user/user.repository';
import UserService from '../user/user.service';
import UserController from '../user/user.controller';
import IUserService from '../user/user.service.interface';
import ApplicationRouter from '../router';

const container = new Container({ defaultScope: 'Singleton' });
// Like other dependencies we do not resolve ApplicationRouter via `TYPES`.
// We get the instance of the class only in app.ts file during bootstrap.
container.bind(ApplicationRouter).to(ApplicationRouter);

container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);

export default container;
