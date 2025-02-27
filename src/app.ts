import 'reflect-metadata';
import { install as sourceMapInit } from 'source-map-support';
import * as dotenv from 'dotenv';
sourceMapInit();
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import compress from 'compression';
import cors from 'cors';
import logger from './libs/logger';
import routes from './routes';
import { provider } from './di.provider';
import { NotFound, HttpError } from './libs/errors';

async function main() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.disable('x-powered-by');
  app.use(compress());
  app.use(cors());
  app.use('/', express.static('public'));

  const config = provider.configuration;

  if (config.env === 'production') {
    // For example: Enable sentry in productionF
    // app.use(Sentry.Handlers.requestHandler());
  }

  await provider.database.connect();

  app.use('/api', routes);

  // Handle errors
  app.use(() => {
    throw new NotFound('You are lost');
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      logger.error(error?.message, error.stack);
      if (error.message) {
        res.status(error.code ?? 400).send(error.message);
        return;
      }
    }

    res.status(500).send(error.message + '\n');
  });

  // Start server
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    logger.info(`Running Node.js version ${config.nodeVersion}`);
    logger.info(`App environment: ${config.env}`);
    logger.info(`App is running on port ${config.port}`);
  });
}

main().catch((e) => {
  logger.error('Failed to start app', e);
});
