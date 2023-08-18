import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';
import { EventEmitter } from 'events';
import logger from './logger';

/**
 * All the methods and properties mentioned in the following class is
 * specific to MongoDB. You should make necessary changes to support
 * the database/orm you want to use.
 */
class Database extends EventEmitter {
  private password: string;
  private user: string;
  private host: string;
  private dbName: string;
  private dbClient: MongoClient;
  private databaseInstance: Db;
  private mongoProtocol = 'mongodb';

  constructor() {
    super();

    this.password = process.env.DATABASE_PASSWORD;
    this.user = process.env.DATABASE_USER;
    this.host = process.env.DATABASE_HOST;
    this.dbName = process.env.DATABASE_NAME;

    if (process.env.MONGO_PROTOCOL) {
      this.mongoProtocol = process.env.MONGO_PROTOCOL;
    }
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
    } catch (e) {
      logger.error('Failed to connect to database', e.stack);
    }
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
    return this.databaseInstance?.collection(name);
  }

  /**
   * Build database connection string.
   * Customize as needed for your database.
   */
  private getConnectionString() {
    return `${this.mongoProtocol}://${this.user}:${this.password}@${this.host}/${this.dbName}`;
  }

  public getHost() {
    return this.host;
  }

  public getPassword() {
    return this.password;
  }

  public getUser() {
    return this.user;
  }

  public getName() {
    return this.dbName;
  }

  public isConnected() {
    return Boolean(this.dbClient);
  }
}

export default new Database();
