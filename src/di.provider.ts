import { Configuration } from './config';
import { Database } from './database';
import { IDatabase } from './interfaces/database';
import { UserRepository } from './repositories/user';
import UserService from './services/user';

class Providers {
  public readonly configuration: Configuration;
  public readonly database: IDatabase;

  public readonly userRepository: UserRepository;

  // services
  public readonly userService: UserService;
  constructor() {
    const config = new Configuration();

    this.configuration = config;
    this.database = new Database(config);

    // repositories
    this.userRepository = new UserRepository(this.database);

    // services
    this.userService = new UserService(this.userRepository);
  }
}

export const provider = new Providers();
