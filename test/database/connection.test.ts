import db from '../../src/config/database.config';

describe('Database', () => {
  test('Test connection', async () => {
    await db.connect();
  });
});
