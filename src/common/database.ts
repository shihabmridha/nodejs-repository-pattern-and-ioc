import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';
import logger from './logger';

/**
 * All the methods and properties mentioned in the following class is
 * specific to MongoDB. You should make necessary changes to support
 * the database/orm you want to use.
 */
class Database {
  private password: string;

  private user: string;

  private host: string;

  private dbName: string;

  private dbClient: MongoClient;

  private databaseInstance: Db;

  constructor() {
    this.password = process.env.DB_PWD;
    this.user = process.env.DB_USER;
    this.host = process.env.DB_HOST;
    this.dbName = process.env.DB_NAME;
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

    this.dbClient = await client.connect();
    logger.info('Connected with database host');

    this.databaseInstance = this.dbClient.db(this.dbName);
  }

  public async disconnect() {
    if (this.dbClient) {
      logger.info(`Disconnected from ${this.host}/${this.dbName}`);
      await this.dbClient.close();
    }
  }

  /**
   * For MongoDB there is no table. It is called collection
   * If you are using SQL database then this should be something like getTable()
   *
   * @param name MongoDB Collection name
   */
  public getCollection(name: string): Collection {
    if (!this.databaseInstance) {
      throw new Error('Database not initialized');
    }

    return this.databaseInstance.collection(name);
  }

  /**
   * Build database connection string.
   * Customize as needed for your database.
   */
  private getConnectionString() {
    return `mongodb://${this.user}:${this.password}@${this.host}/${this.dbName}`;
  }

  public getDbHost() {
    return this.host;
  }

  public getDbPassword() {
    return this.password;
  }

  public getDbUser() {
    return this.user;
  }

  public getDbName() {
    return this.dbName;
  }

  public isDbConnected() {
    return Boolean(this.dbClient);
  }
}

const db = new Database();

export default db;
