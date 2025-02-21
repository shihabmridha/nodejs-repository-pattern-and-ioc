// import { install as installSourceMapSupport } from 'source-map-support';
// installSourceMapSupport();
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import * as compress from 'compression';
import * as cors from 'cors';
import errorHandler from './libs/error.handler';
import logger from './libs/logger';
import database from './database';
import container from './libs/inversify';
import ApplicationRouter from './router';

async function bootstrap() {
  const app = express();

  app.disable('x-powered-by');
  app.use(compress());

  // Enable middleware/whatever only in Production
  if (process.env.NODE_ENV === 'production') {
    // For example: Enable sentry in production
    // app.use(Sentry.Handlers.requestHandler());
  }

  /**
   * Configure cors
   */
  app.use(cors());

  /**
   * Configure database
   **/
  await database.connect();

  /**
   * Configure body parser
   */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /**
   * Host static public directory
   */
  app.use('/', express.static('public'));

  /**
   * Configure routes
   */
  // Let inversify resolve the dependency
  const router = container.get<ApplicationRouter>(ApplicationRouter);
  router.register(app);

  /**
   * Configure error handler
   */
  errorHandler(app);

  /**
   * Setup listener port
   */
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Running Node.js version ${process.version}`);
    logger.info(`App environment: ${process.env.NODE_ENV}`);
    logger.info(`App is running on port ${PORT}`);
  });
}

bootstrap().catch((e) => console.error(e));
