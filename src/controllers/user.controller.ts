import { Request, Response } from 'express';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import { BadRequestError, MissingFieldError } from '../errors/app.errors';
import UserRepository, { getUserRepository } from '../repositories/user.repository';
import { UserCreateDTO } from '../dto/user.dto';
import StaticStringKeys from '../constants';
import { Controller, Get, Post } from '../core/decorators';
import { UserDocument } from '../models/user.model';
import * as Environment from '../environments';

export enum USER_ROLE {
  ADMIN = 1,
  MODERATOR = 2,
  VISITOR = 3
}

@Controller('/users')
export default class UserController {
  private repository: UserRepository;
  private pageSize: number;

  constructor(repository: UserRepository) {
    this.repository = repository;
    this.pageSize = 20;
  }

  @Get('/')
  public async getAll(req: Request, res: Response) {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : this.pageSize;
    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;

    let documents: UserDocument[];
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

  @Get('/:id')
  public async get(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('id');
    }

    const user = await this.repository.get(req.params.id);
    res.send(user);
  }

  /**
   * Create user
   * @requires username An unique user name
   * @requires password A valid password
   * @requires email A valid email
   **/
  @Post('/')
  public async create(req: Request, res: Response) {

    if (!req.body.email) {
      throw new MissingFieldError('email');
    }

    if (!req.body.username) {
      throw new MissingFieldError('username');
    }

    if (!req.body.password) {
      throw new MissingFieldError('password');
    }

    if (!isEmail(req.body.email)) {
      throw new BadRequestError(StaticStringKeys.INVALID_EMAIL);
    }

    if (!isLength(req.body.password.trim(), { min: 4, max: 20 })) {
      throw new BadRequestError(StaticStringKeys.INVALID_PASSWORD);
    }

    const normalizedEmail = this.repository.normalizeEmail(req.body.email);
    const normalizedUsername = this.repository.normalizeUsername(req.body.username);

    const users = await this.repository.find({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] }, 2);

    users.forEach((user) => {
      if (user.email === normalizedEmail) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      if (user.username === normalizedUsername) {
        throw new BadRequestError(StaticStringKeys.USERNAME_NOT_AVAILABLE);
      }
    });

    const password = await this.repository.hashPassword(req.body.password);

    const userData: UserCreateDTO = {
      username: normalizedUsername,
      email: normalizedEmail,
      password
    };

    await this.repository.create(userData);

    res.sendStatus(201);
  }

  /**
   * Update email
   */
  public async updateEmail(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('id');
    }

    if (!req.body.email) {
      throw new MissingFieldError('email');
    }

    if (!isEmail(req.body.email)) {
      throw new BadRequestError(StaticStringKeys.INVALID_EMAIL);
    }

    const user = await this.repository.get(req.params.id);

    if (req.body.email !== user.email) {
      const normalizedEmail = this.repository.normalizeEmail(req.body.email);
      const isEmailAvailable = await this.repository.isEmailAvailable(normalizedEmail);

      if (!isEmailAvailable) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      await this.repository.updateEmail(user._id, normalizedEmail);
    }

    res.sendStatus(204);
  }

  /**
   * Update password
   */
  public async updatePassword(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('id');
    }

    if (!req.body.password) {
      throw new MissingFieldError('password');
    }

    const repository = getUserRepository();

    const newPassword = await repository.hashPassword(req.body.password);

    await repository.updatePassword(req.params.id, newPassword);

    res.sendStatus(204);
  }

}
