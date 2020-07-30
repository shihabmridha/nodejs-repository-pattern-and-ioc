import db from '../../src/database';

describe('Database', () => {
  test('Test connection', async () => {
    await db.connect();
  });
});
