import * as faker from 'faker';
import * as Environment from '../src/environments';
import log from '../src/config/log.config';

import { UserModel } from '../src/models/user.model';

import { getUserRepository } from '../src/repositories/user.repository';

if (Environment.NODE_ENV !== 'test') {
  log.error('Invalid environment for tests');
  process.exit(1);
}

beforeEach(async () => {
  try {
    await clearDatabase();
  } catch (error) {
    log.info(error.message);
  }
});

beforeAll(async () => {
  try {
    await clearDatabaseIndices();
  } catch (error) {
    log.info(error.message);
  }
});

async function clearDatabase() {
  await getUserRepository().removeMany();
}

async function clearDatabaseIndices() {
  await UserModel.collection.dropIndexes();
}

export async function createUser(username?: string, email?: string, password = 'password') {
  username = username ?? faker.internet.userName();
  email = email ?? faker.internet.email();
  // password = 'password';

  const user = await getUserRepository().create({ username, email, password });
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
