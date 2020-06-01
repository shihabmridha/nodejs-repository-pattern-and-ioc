import { Collection, FilterQuery, ObjectID } from 'mongodb';
import db from './config/database.config';
import BaseDTO from './dto/base.dto';
import { getValidObjectId } from './helpers';

export type Query<BaseDTO> = FilterQuery<BaseDTO>;

export interface Projection {
  [key: string]: 1 | 0;
}

export interface Sort {
  [key: string]: 1 | -1;
}

export interface IRepository<T> {
  getById(id: ObjectID, projection: Projection): Promise<T | T[]>;
  getAll(limit: number, page: number, sort: Sort, projection: Projection): Promise<T[]>;
  find(filter: Query<T>, limit: number, page: number, sort: Sort, projection: Projection): Promise<T[]>;

  create(data: BaseDTO): Promise<T>;
  createMany(data: BaseDTO[]): Promise<T[]>;

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
export default class Repository<T> implements IRepository<T> {

  protected readonly collection: Collection;

  constructor(collection: string) {
    this.collection = db.getCollection(collection);
  }

  /**
   * Receives an ID and fetch data from database by that ID.
   * @param id Id of the document
   * @param projection Field to project properties. This is optional.
   */
  public async getById(id: ObjectID, projection: Projection = {}): Promise<T> {
    const objectId = getValidObjectId(id);

    const collection = this.collection;

    const doc: T = await collection.findOne<T>({ _id: objectId }, projection);

    return doc;
  }

  public async getAll(limit: number = 20, page: number = 1, sort?: Sort, projection: Projection = {}): Promise<T[]> {
    const collection = this.collection;

    const query = collection.find<T>({}, projection);

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

  public async find(filter: Query<BaseDTO>, limit: number, arg?: number | Projection): Promise<T[]>;
  public async find(filter: Query<BaseDTO>, limit: number = 10, page: number = 0, sort?: Sort, projection?: Projection): Promise<T[]> {
    const collection = this.collection;
    const query = collection.find<T>(filter, projection);

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

  public async create(data: BaseDTO): Promise<T> {
    if (!data) {
      throw new Error('Empty object provided');
    }

    const collection = this.collection;
    const doc = (await collection.insertOne(data)).ops[0] as T;

    return doc;
  }

  public createMany(_data: BaseDTO[]): Promise<T[]> {
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
