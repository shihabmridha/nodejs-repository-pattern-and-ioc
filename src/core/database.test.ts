// Database connection depends on credentials in .env file
// `Database` class does not read .env file, so we need to load it manually
import * as dotenv from 'dotenv';
dotenv.config();

import db from './database';

describe('Database', () => {
  it('Test connection', async () => {
    await db.connect();
  });
});
