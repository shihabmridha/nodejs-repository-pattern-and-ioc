import { injectable } from 'inversify';
import { ObjectID } from 'mongodb';
import Repository, { IRepository } from './repository';

/**
 * The schema definition. In other word,
 * A Document of the user collection contains following fields.
 */
export interface UserDocument {
  _id: ObjectID;
  username: string;
  email: string;
  lastLoggedIn?: Date;
  password: string;
  role?: number;
  deletedAt?: Date;
  createdAt?: Date;
}

/**
 * Repository interface.
 */
export interface IUserRepository extends IRepository<UserDocument> {
  isUsernameExists(username: string): Promise<boolean>;
  isEmailExists(username: string): Promise<boolean>;
}

/**
 * User repository. In the constructor we pass the collection name to the
 * parent constructor.
 *
 */
@injectable()
export default class UserRepository extends Repository<UserDocument> implements IUserRepository {
  constructor() {
    super('users'); // Passing collection name
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    const user = await this.find({ username }, 1, 0, { _id : 1 });
    if (user.length > 0) {
      return true;
    }

    return false;
  }

  public async isEmailExists(email: string): Promise<boolean> {
    const user = await this.find({ email }, 1, 0, { _id : 1 });
    if (user.length > 0) {
      return true;
    }

    return false;
  }
}
