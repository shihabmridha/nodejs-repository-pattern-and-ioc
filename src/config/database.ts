import { Application } from 'express';
import * as mongoose from 'mongoose';
import * as Environment from '../environments';
import logger from '../log';

const DB_PASSWORD = process.env.DB_PWD || '';
const DB_USER = process.env.DB_USER || '';
const DB_HOST = process.env.DB_HOST || 'localhost:27017';
let DB_NAME = process.env.DB_NAME || 'my-db';

function getDatabaseUrl() {
  const env = Environment.NODE_ENV;

  if (env === 'test' && !process.env.DB_NAME) {
    DB_NAME += '_test';
  }

  if (env !== 'localhost' && DB_USER && DB_PASSWORD) {
    return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
  }

  return `mongodb://${DB_HOST}/${DB_NAME}`;
}

function getDatabaseOptions(): mongoose.ConnectionOptions {
  /**
   * For details about server configuration parameters, see
   * http://mongoosejs.com/docs/connections.html
   * http://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html
   */

  const TWO_MINUTES_IN_MS = 2 * 60 * 1000;
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

  let autoIndex = false;

  if (Environment.NODE_ENV === 'locahost') {
    autoIndex = true;
  }

  return {
    poolSize: 50,
    connectTimeoutMS: TWO_MINUTES_IN_MS,
    socketTimeoutMS: ONE_DAY_IN_MS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex
  };
}

export function connectToDatabase(app: Application) {
  const dbUrl = getDatabaseUrl();
  const dbOptions = getDatabaseOptions();

  logger.debug(`Database user: ${DB_USER}`);
  logger.debug(`Database password: ${DB_PASSWORD}`);
  logger.debug(`Database name: ${DB_NAME}`);

  logger.info(`App database URL: ${dbUrl}`);

  mongoose.connect(dbUrl, dbOptions).catch();

  mongoose.connection.on('error', (err) => {
    logger.error('mongoose.js error ', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    logger.warn(`mongoose.js reconnected`);
  });

  mongoose.connection.on('disconnected', (err) => {
    logger.warn(`mongoose.js disconnect`, err);
  });

  mongoose.connection.on('timeout', (err) => {
    logger.error(`mongoose.js request timeout`, err);
  });

  mongoose.connection.once('open', function () {
    logger.info(`Connected with Database`);
  });

  app.set('dbClient', mongoose);
}
