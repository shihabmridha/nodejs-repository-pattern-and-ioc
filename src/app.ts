import { install as installSourceMapSupport } from 'source-map-support';
installSourceMapSupport();

import * as express from 'express';
import * as compress from 'compression';
import app from './server';
import * as Environment from './environments';
import { configCors } from './cors';
import services from './services';
import errorHandler from './errorHandler';

app.disable('x-powered-by'); // Hide information
app.use(compress()); // Compress

// Enable middleware/whatever only in Production
if (Environment.NODE_ENV === 'production') {
  // For example: Enable sentry in production
  // app.use(Sentry.Handlers.requestHandler());
}

/**
 * Configure cors
 */
configCors(app);

/**
 * Configure mongoose
 **/
import { connectToDatabase } from './config/database';
connectToDatabase(app);

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
 * Configure services
 */
services(app);

/**
 * Configure error handler
 */
errorHandler(app);

export default app;
