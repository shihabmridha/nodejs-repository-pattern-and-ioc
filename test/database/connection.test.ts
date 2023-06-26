import db from '../../src/common/database';

describe('Database', () => {
  test('Test connection', async () => {
    await db.connect();
  });
});
