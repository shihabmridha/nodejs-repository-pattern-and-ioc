import { ObjectID } from 'mongodb';
import * as fs from 'fs';
import * as utils from 'util';
import { InvalidIdError } from '../errors/app.errors';

// Promisify some utility functions
export const exists = utils.promisify(fs.exists);
export const mkdir = utils.promisify(fs.mkdir);

export function getValidObjectId(id: string | ObjectID) {
  if (!ObjectID.isValid(id)) {
    throw new InvalidIdError();
  }

  if (typeof id === 'string') {
    id = new ObjectID(id);
  }

  return id;
}
