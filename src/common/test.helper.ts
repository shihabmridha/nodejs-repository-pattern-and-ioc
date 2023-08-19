import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import UserRepository from '../user/user.repository';
import logger from '../core/logger';
import database from '../core/database';

export async function testPreparation() {
  await database.connect();
  await clearDatabase();
}

export async function clearDatabase() {
  try {
    const userRepository = new UserRepository();
    await userRepository.removeMany({});
  } catch (error) {
    logger.log('error', error.message);
  }
}
