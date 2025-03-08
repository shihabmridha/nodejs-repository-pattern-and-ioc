import { BaseRepository } from './base';
import { UserEntity } from '../entities/user';
import { IDatabase } from '../interfaces/database';

export class UserRepository extends BaseRepository<UserEntity> {
  protected _getEntityName(): string {
    throw new Error('Method not implemented.');
  }

  constructor(db: IDatabase) {
    super(db, 'users'); // users = collection name
  }

  public async isEmailExists(email: string): Promise<boolean> {
    const user = await this.collection.findOne(
      { email },
      { projection: { _id: 1 } },
    );

    return user !== null;
  }
}
