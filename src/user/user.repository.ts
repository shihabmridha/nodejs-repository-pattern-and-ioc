import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import Repository from '../core/repository';

export interface UserDocument {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  updatedAt?: Date;
  createdAt?: Date;
}

@injectable()
export default class UserRepository extends Repository<UserDocument> {
  constructor() {
    // MongoDB collection name
    super('users');
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    const users = await this.find({ username }, { projection: { _id: 1 } });
    if (users.length > 0) {
      return true;
    }

    return false;
  }

  public async isEmailExists(email: string): Promise<boolean> {
    const users = await this.find({ email }, { projection: { _id: 1 } });
    if (users.length > 0) {
      return true;
    }

    return false;
  }
}
