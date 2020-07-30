import { injectable, unmanaged } from 'inversify';
import { Collection, FilterQuery, ObjectID } from 'mongodb';
import db from '../database';
import { getValidObjectId } from '../utils/utils';

/**
 * Fields you want to select. For mongodb it is a key-value pair.
 * Key is the name of the field and Value is 0 (exclude) or 1 (include).
 * Example: { username: 1, email: 1 } (Select only username and email)
 */
export interface Select {
  [key: string]: 1 | 0;
}

/**
 * Fields you want to order by. For mongodb it is a key-value pair.
 * Key is the name of the field and Value is 1 (ascending) or -1 (descending).
 * Example: { username: 1 } (Sort result by username in ascending order)
 */
export interface Sort {
  [key: string]: 1 | -1;
}

/**
 * Base repository interface
 */
export interface IRepository<T> {
  get(id: ObjectID, select?: Select): Promise<T>;
  getAll(limit: number, page: number, select?: Select, sort?: Sort): Promise<T[]>;
  find(filter: FilterQuery<T>, limit: number, page?: number, select?: Select, sort?: Sort): Promise<T[]>;

  create(data: Partial<T>): Promise<T>;
  createMany(data: Partial<T[]>): Promise<T[]>;

  update(data: Partial<T>): Promise<void>;
  updateById(id: ObjectID, data: Partial<T>): Promise<void>;

  remove(id: ObjectID): Promise<void>;
  removeMany(ids: ObjectID[]): Promise<void>;
}

/**
 * This Repository class is the base repository. It is an abstract class because it can only be
 * extended. This class is writen to support mongoose properly which means it will look different
 * if you use mongodb driver directly or use any other orm or database driver.
 *
 * The collection property is the mongoose collection in this case. For you, it can be mongodb collection for example.
 */
@injectable()
export default class Repository<T> implements IRepository<T> {

  protected readonly collection: Collection;

  constructor(@unmanaged() collection: string) {
    this.collection = db.getCollection(collection);
  }

  /**
   * Receives an ID and fetch data from database by that ID.
   * @param id Id of the document
   * @param select Field to project properties. This is optional.
   */
  public async get(id: ObjectID, select: Select = {}): Promise<T> {
    const objectId = getValidObjectId(id);

    const collection = this.collection;

    const doc: T = await collection.findOne<T>({ _id: objectId }, select);

    return doc;
  }

  public async getAll(limit: number = 20, page: number = 1, select: Select = {}, sort?: Sort): Promise<T[]> {
    const collection = this.collection;

    const query = collection.find<T>({}, select);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.toArray();

    return docs;
  }

  public async find(filter: FilterQuery<Partial<T>>, limit: number = 10, page: number = 0, select?: Select, sort?: Sort): Promise<T[]> {
    const collection = this.collection;
    const query = collection.find<T>(filter, select);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.toArray();

    return docs;
  }

  public async create(data: Partial<T>): Promise<T> {
    if (!data) {
      throw new Error('Empty object provided');
    }

    const collection = this.collection;
    const doc = (await collection.insertOne(data)).ops[0] as T;

    return doc;
  }

  public createMany(_data: Partial<T[]>): Promise<T[]> {
    throw new Error("Method not implemented.");
  }

  public async update(_data: Partial<T>): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async remove(id: ObjectID): Promise<void> {
    const objectId = getValidObjectId(id);

    const collection = this.collection;
    await collection.findOneAndDelete({ _id: objectId });
  }

  /**
   * If array of id is provided then only remove those items.
   * If noting is given then remove all items
   *
   * @param ids Array of ids to delete.
   */
  public async removeMany(ids?: ObjectID[]): Promise<void> {
    const collection = this.collection;

    if (Array.isArray(ids) && ids.length > 0) {
      const objectIds = ids.map((id) => getValidObjectId(id));
      await collection.deleteMany({ _id: { $in: objectIds } });
    }

    await collection.deleteMany({});
  }

  public async updateById(id: ObjectID, data: Partial<T>) {
    const objectId = getValidObjectId(id);

    const collection = this.collection;
    await collection.update({ _id: objectId }, data);
  }

  public getCollection(): Collection {
    return this.collection;
  }
}
