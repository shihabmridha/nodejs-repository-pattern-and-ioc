import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import { EventEmitter } from 'events';
import logger from './libs/logger';
import { Configuration } from './config';
import { IDatabase } from './interfaces/database';

export class Database extends EventEmitter implements IDatabase {
  private readonly password: string;
  private readonly user: string;
  private readonly host: string;
  private readonly dbName: string;
  private dbClient: MongoClient;
  private databaseInstance: Db;
  private readonly mongoProtocol;

  constructor(config: Configuration) {
    super();

    this.password = config.database.password;
    this.user = config.database.username;
    this.host = config.database.host;
    this.dbName = config.database.name;
    this.mongoProtocol = config.database.mongoProtocol;
    this.databaseInstance = {} as Db;
    this.dbClient = {} as MongoClient;
  }

  public async connect(): Promise<void> {
    if (this.dbClient) {
      logger.debug('Connection already exists');
      return;
    }

    if (!this.password) {
      throw new Error('Database password not found');
    }

    if (!this.user) {
      throw new Error('Database user not found');
    }

    if (!this.host) {
      throw new Error('Database host not found');
    }

    if (!this.dbName) {
      throw new Error('Database name not found');
    }

    const TWO_MINUTES_IN_MS = 2 * 60 * 1000;
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

    const connectionString = this.getConnectionString();

    logger.debug(`Database connection string: ${connectionString}`);

    const client = new MongoClient(connectionString, {
      maxPoolSize: 50,
      connectTimeoutMS: TWO_MINUTES_IN_MS,
      socketTimeoutMS: ONE_DAY_IN_MS,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    try {
      this.dbClient = await client.connect();
      logger.info('Connected with database host');
      this.emit('connected');
      this.databaseInstance = this.dbClient.db(this.dbName);
    } catch (e: any) {
      logger.error('Failed to connect to database', e.stack);
    }
  }

  public async disconnect() {
    if (this.dbClient) {
      logger.info(`Disconnected from ${this.host}/${this.dbName}`);
      await this.dbClient.close();
    }
  }

  public instance<T>(): T {
    return this.databaseInstance as T;
  }

  private getConnectionString() {
    return `${this.mongoProtocol}://${this.user}:${this.password}@${this.host}/${this.dbName}`;
  }
}
