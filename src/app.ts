import { install as installSourceMapSupport } from 'source-map-support';
installSourceMapSupport();
import 'reflect-metadata';
import * as express from 'express';
import * as compress from 'compression';
import app from './server';
import * as cors from 'cors';
import errorHandler from './common/errors/error.handler';
import logger from './common/logger';
import initDB from './common/database';
import container from './inversify';
import ApplicationRouter from './router';

/**
 * This is a bootstrap function
 */
async function bootstrap() {
  // Attach HTTP request info logger middleware in test mode
  if (process.env.NODE_ENV === 'test') {
    app.use((req: express.Request, _res, next) => {
      logger.debug(`[${req.method}] ${req.hostname}${req.url}`);

      next();
    });
  }

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
  if (!initDB.isDbConnected()) {
    await initDB.connect();
  }

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
}

// Need for integration testing
export default app;

// Invoking the bootstrap function
bootstrap()
  .then(() => {
    logger.info('Server is up');
  })
  .catch((error) => {
    logger.error('Unknown error. ' + error.message);
  });
