import { Model, Document, FilterQuery, Types } from 'mongoose';
import { InvalidIdError } from '../appErrors';

export type Query<T> = FilterQuery<T>;

export interface Projection {
  [key: string]: 1 | 0;
}

export interface Sort {
  [key: string]: 1 | -1;
}

export interface IRepository<T, K> {
  get(id: string, projection: Projection): Promise<K>;
  getAll(limit: number, page: number, sort: Sort, projection: Projection): Promise<K[]>;
  find(filter: Query<T>, limit: number, page: number, sort: Sort, projection: Projection): Promise<K[]>;

  create(data: K): Promise<K>;
  createMany(data: K[]): Promise<K[]>;

  remove(id: string): Promise<void>;
  removeMany(ids: string[]): Promise<void>;
}

export class Repository<T extends Document, K> implements IRepository<T, K> {

  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async get(id: string, projection: Projection = {}): Promise<K> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    const model = this.getModel();

    const doc: K = await model.findById(id, projection).lean<K>().exec();

    return doc;
  }

  public async getAll(limit: number = 20, page: number = 1, sort?: Sort, projection: Projection = {}): Promise<K[]> {
    const model = this.getModel();

    const query = model.find({}, projection);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.lean<K>().exec();

    return docs;
  }

  public async find(filter: Query<T>, limit: number, arg?: number | Projection): Promise<K[]>;
  public async find(filter: Query<T>, limit: number = 10, page: number = 0, sort?: Sort, projection?: Projection): Promise<K[]> {
    const model = this.getModel();

    const query = model.find(filter, projection);

    if (sort) {
      query.sort(sort);
    }

    if (page > 0) {
      const skip = limit * (page - 1);
      query.skip(skip);
    }

    query.limit(limit);

    const docs = await query.lean<K>().exec();

    return docs;
  }

  public async create(data: K): Promise<K> {
    if (!data) {
      throw new Error('Empty object provided');
    }

    const model = this.getModel();
    const doc = (await model.create(data)).toObject() as K;

    return doc;
  }

  public createMany(_data: K[]): Promise<K[]> {
    throw new Error("Method not implemented.");
  }

  public async remove(id: string): Promise<void> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    const model = this.getModel();
    await model.findByIdAndRemove(id).exec();
  }

  public async removeMany(ids?: string[]): Promise<void> {
    const model = this.getModel();

    if (Array.isArray(ids) && ids.length > 0) {
      await model.deleteMany({ _id: { $in: ids }} as FilterQuery<T>).exec();
    }
    await model.deleteMany({}).exec();
  }

  protected getModel(): Model<T> {
    return this.model;
  }

}
