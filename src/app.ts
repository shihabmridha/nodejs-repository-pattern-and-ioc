import { install as installSourceMapSupport } from 'source-map-support';
import * as dotenv from 'dotenv';
installSourceMapSupport();
dotenv.config();

import express from 'express';
import compress from 'compression';
import cors from 'cors';
import logger from './libs/logger';
import { provider } from './di.provider';
// import errorHandler from './libs/error.handler';
// import database from './database';
// import ApplicationRouter from './router';

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
  // For example: Enable sentry in production
  // app.use(Sentry.Handlers.requestHandler());
}

await provider.database.connect();

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

// async function bootstrap() {
//   const app = express();


//   // Enable middleware/whatever only in Production

//   /**
//    * Configure cors
//    */
//   app.use(cors());

//   /**
//    * Configure database
//    **/
//   await database.connect();

//   /**
//    * Configure body parser
//    */
//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));

//   /**
//    * Host static public directory
//    */
//   app.use('/', express.static('public'));

//   /**
//    * Configure routes
//    */
//   // Let inversify resolve the dependency
//   // router.register(app);

//   /**
//    * Configure error handler
//    */
//   errorHandler(app);


// }
