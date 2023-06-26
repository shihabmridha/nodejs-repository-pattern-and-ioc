import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import Repository, { IRepository } from '../common/repository';

/**
 * The schema definition. In other word,
 * A Document of the user collection contains following fields.
 */
export interface UserDocument {
  _id: ObjectId;
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

@injectable()
export default class UserRepository extends Repository<UserDocument> implements IUserRepository {
  constructor() {
    // MongoDB collection name
    super('users');
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    const user = await this.find({ username }, 1, 0, { _id: 1 });
    if (user.length > 0) {
      return true;
    }

    return false;
  }

  public async isEmailExists(email: string): Promise<boolean> {
    const user = await this.find({ email }, 1, 0, { _id: 1 });
    if (user.length > 0) {
      return true;
    }

    return false;
  }
}
