import { Configuration } from './config';
import { Database } from './database';
import { IDatabase } from './interfaces/database';

class Providers {
  public readonly configuration: Configuration;
  public readonly database: IDatabase;
  constructor() {
    const config = new Configuration();

    this.configuration = config;
    this.database = new Database(config);
  }
}

export const provider = new Providers();
