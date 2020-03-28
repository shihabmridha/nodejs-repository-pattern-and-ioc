import { Application } from 'express';
import * as cors from 'cors';

export function configCors(app: Application) {
  const whitelist = ['http://localhost:3000'];

  const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  };

  app.options('*', cors()); // CORS pre-flight
  app.use(cors(corsOptions));
}
