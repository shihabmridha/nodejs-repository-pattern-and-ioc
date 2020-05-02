import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { BadRequestError, MissingFieldError, NotFoundError } from '../appErrors';
import * as Environment from '../environments';
import { Repository } from '../repositories/repository';
import StaticStringKeys from '../statisString';

interface IServiceConfiguration {
  pageSize: number;
}

export default abstract class Service<T extends Document, K> {
  private repository: Repository<T, K>;
  private pageSize: number;

  constructor(repository: Repository<T, K>, config?: IServiceConfiguration) {
    this.repository = repository;

    this.pageSize = config?.pageSize || 20;
  }

  public async get(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('Invalid id');
    }

    const user = await this.repository.get(req.params.id);

    if (!user) {
      throw new NotFoundError(StaticStringKeys.USER_NOT_FOUND);
    }

    res.send(user);
  }

  public async find(req: Request, res: Response) {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : this.pageSize;
    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;

    let documents: K[];
    if (req.query.filter) {
      documents = await this.repository.find(req.query, pageSize, pageNumber);
    } else {
      documents = await this.repository.getAll(pageSize, pageNumber);
    }

    res.send({
      users: documents,
      pageSize,
      pageNumber,
      next: documents.length < pageSize ? '' : `${Environment.BASE_URL}${req.path}?page=${pageNumber + 1}`,
      previous: (pageNumber > 1) ? `${Environment.BASE_URL}${req.path}?page=${pageNumber - 1}` : ''
    });
  }

  public async create(req: Request, res: Response) {
    if (!req.body) {
      throw new BadRequestError('Empty body');
    }

    const doc = await this.repository.create(req.body);

    res.send(doc);
  }

  public async delete(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('Id is missing');
    }

    if (Array.isArray(req.params.id)) {
      await this.repository.removeMany(req.params.id);
    } else {
      await this.repository.remove(req.params.id);
    }

    res.sendStatus(204);
  }
}
