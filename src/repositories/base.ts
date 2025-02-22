import { Collection, Db, ObjectId } from 'mongodb';
import { IDatabase } from '../interfaces/database';

export abstract class BaseRepository<TEntity> {
  protected readonly collection: Collection;

  constructor(db: IDatabase, collectionName: string) {
    this.collection = db.instance<Db>().collection(collectionName);
  }

  public async create(data: Partial<TEntity>): Promise<ObjectId> {
    const objectId = (await this.collection.insertOne(data)).insertedId;
    return objectId;
  }

  public async findById(id: string): Promise<TEntity | null> {
    const doc = await this.collection.findOne<TEntity>({
      _id: new ObjectId(id),
    });

    return doc;
  }

  public async remove(id: string): Promise<void> {
    await this.collection.deleteOne({
      _id: new ObjectId(id),
    });
  }
}
