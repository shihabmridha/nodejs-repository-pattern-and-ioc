import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV });

export const NODE_ENV = process.env.NODE_ENV || 'localhost';
export const PORT = process.env.PORT || 3000;

function getBaseApiUrl() {
  switch (NODE_ENV) {
    case 'development':
      return process.env.DEV_URL;
    case 'production':
      return process.env.PROD_URL;
    default:
      return `http://localhost:${PORT}`;
  }
}

export const BASE_URL = getBaseApiUrl();
