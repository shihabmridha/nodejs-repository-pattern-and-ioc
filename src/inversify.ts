import { Container } from 'inversify';
import { TYPES } from './types';
import UserRepository, { IUserRepository } from './repositories/user.repository';
import UserService, { IUserService } from './services/user.service';
import UserController from './controllers/user.controller';

const container = new Container({ defaultScope: 'Singleton' });
container.bind(UserController).to(UserController);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);

export default container;
