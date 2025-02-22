import { BaseRepository } from './base';
import { UserEntity } from '../entities/user';
import { IDatabase } from '../interfaces/database';

export class UserRepository extends BaseRepository<UserEntity> {
  constructor(db: IDatabase) {
    super(db, 'users'); // users = collection name
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    const user = await this.collection.findOne(
      { username },
      { projection: { _id: 1 } },
    );

    return user !== null;
  }

  public async isEmailExists(email: string): Promise<boolean> {
    const user = await this.collection.findOne(
      { email },
      { projection: { _id: 1 } },
    );

    return user !== null;
  }
}
