import * as faker from 'faker';
import db from '../core/database';
import UserRepository from '../user/user.repository';
import logger from '../core/logger';

export function testPreparation() {
  beforeEach(async () => {
    try {
      if (db.isConnected()) {
        await clearDatabase();
      }
    } catch (error) {
      logger.log('error', error.message);
    }
  });

  beforeAll((done) => {
    if (db.isConnected()) {
      done();
    } else {
      db.on('connected', async () => {
        await clearDatabaseIndices();
        done();
      });
    }
  });
}

const userRepository = new UserRepository();

async function clearDatabase() {
  await userRepository.remove({}, true);
}

async function clearDatabaseIndices() {
  await userRepository.getCollection().dropIndexes();
}

export async function createUser(
  username?: string,
  email?: string,
  password = 'password',
) {
  username = username ?? faker.internet.userName();
  email = email ?? faker.internet.email();
  // password = 'password';

  const docId = await userRepository.create({ username, email, password });
  const user = await userRepository.findById(docId);
  return user;
}

export async function createNUsers(number: number) {
  while (number--) {
    const password = 'test';
    const email = faker.internet.email();
    const username = faker.internet.userName();
    await createUser(username, email, password);
  }
}
