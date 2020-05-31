import { Document, FilterQuery, Model, Types } from 'mongoose';
import BaseDTO from './base.dto';
import { InvalidIdError } from '../errors/app.errors';

export type Query<BaseDTO> = FilterQuery<BaseDTO>;

export interface Projection {
  [key: string]: 1 | 0;
}

export interface Sort {
  [key: string]: 1 | -1;
}

export interface IRepository<T> {
  get(id: string, projection: Projection): Promise<T | T[]>;
  getAll(limit: number, page: number, sort: Sort, projection: Projection): Promise<T[]>;
  find(filter: Query<T>, limit: number, page: number, sort: Sort, projection: Projection): Promise<T[]>;

  create(data: BaseDTO): Promise<T>;
  createMany(data: BaseDTO[]): Promise<T[]>;

  remove(id: string): Promise<void>;
  removeMany(ids: string[]): Promise<void>;
}

/**
 * This Repository class is the base repository. It is an abstract class because it can only be
 * extended. This class is writen to support mongoose properly which means it will look different
 * if you use mongodb driver directly or use any other orm or database driver.
 *
 * The model property is the mongoose model in this case. For you, it can be mongodb collection for example.
 */
export default abstract class BaseRepository<T extends Document> implements IRepository<T> {

  private readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Receives an ID and fetch data from database by that ID.
   * @param id Id of the document
   * @param projection Field to project properties. This is optional.
   */
  public async get(id: string, projection: Projection = {}): Promise<T> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    const model = this.model;

    const doc: T = await model.findById(id, projection).lean<T>().exec();

    return doc;
  }

  public async getAll(limit: number = 20, page: number = 1, sort?: Sort, projection: Projection = {}): Promise<T[]> {
    const model = this.model;

    const query = model.find({}, projection);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.lean<T>().exec();

    return docs;
  }

  public async find(filter: Query<BaseDTO>, limit: number, arg?: number | Projection): Promise<T[]>;
  public async find(filter: Query<BaseDTO>, limit: number = 10, page: number = 0, sort?: Sort, projection?: Projection): Promise<T[]> {
    const model = this.model;
    const query = model.find(filter, projection);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.lean<T>().exec();

    return docs;
  }

  public async create(data: BaseDTO): Promise<T> {
    if (!data) {
      throw new Error('Empty object provided');
    }

    const model = this.model;
    const doc = (await model.create(data)).toObject() as T;

    return doc;
  }

  public createMany(_data: BaseDTO[]): Promise<T[]> {
    throw new Error("Method not implemented.");
  }

  public async remove(id: string): Promise<void> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    const model = this.model;
    await model.findByIdAndRemove(id).exec();
  }

  public async removeMany(ids?: string[]): Promise<void> {
    const model = this.model;

    if (Array.isArray(ids) && ids.length > 0) {
      await model.deleteMany({ _id: { $in: ids }} as FilterQuery<T>).exec();
    }
    await model.deleteMany({}).exec();
  }

  protected getModel(): Model<T> {
    return this.model;
  }

}
