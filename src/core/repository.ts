import { injectable, unmanaged } from 'inversify';
import { Collection, Filter, FindOptions, ObjectId } from 'mongodb';
import db from './database';

/**
 * This Repository class is the base repository. It is an abstract class because it can only be
 * extended. This class is writen to support mongoose properly which means it will look different
 * if you use mongodb driver directly or use any other orm or database driver.
 *
 * The collection property is the mongoose collection in this case. For you, it can be mongodb collection for example.
 */
@injectable()
export default abstract class Repository<T> {
  protected readonly collection: Collection;

  constructor(@unmanaged() collection: string) {
    this.collection = db.getCollection(collection);
  }

  public async findOne(
    filter: Filter<Partial<T>>,
    options?: FindOptions<T>,
  ): Promise<T> {
    const doc: T = await this.collection.findOne<T>(filter, options);
    return doc;
  }

  public async find(
    filter: Filter<Partial<T>>,
    options?: FindOptions<T>,
  ): Promise<T[]> {
    const docs = await this.collection.find<T>(filter, options).toArray();
    return docs;
  }

  public async findById(id: string, options?: FindOptions<T>): Promise<T> {
    const doc = await this.collection.findOne<T>(
      { _id: new ObjectId(id) },
      options,
    );

    return doc;
  }

  public async create(data: Partial<T>): Promise<ObjectId> {
    if (!data) {
      throw new Error('Empty object provided');
    }

    const objectId = (await this.collection.insertOne(data)).insertedId;

    return objectId;
  }

  public async removeMany(
    filter: Filter<Partial<T>>,
    options?: FindOptions<T>,
  ) {
    await this.collection.deleteMany(filter, options);
  }

  public async dropIndexes() {
    await this.collection.dropIndexes();
  }
}
