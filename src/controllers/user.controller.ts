import { Request, Response } from 'express';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import { BadRequestError, MissingFieldError } from '../errors/app.errors';
import StaticStringKeys from '../constants';
import { Controller, Get, Post } from '../decorators';
import { UserGetDTO, UserCreateDTO, UserUpdatePasswordDTO, UserUpdateEmailDTO } from '../dto/user.dto';
import User, { UserDocument } from '../models/user.model';
import { getValidObjectId } from '../helpers';
import Repository from '../repository';

export enum USER_ROLE {
  ADMIN = 1,
  MODERATOR = 2,
  VISITOR = 3
}

@Controller('/users')
export default class UserController {
  private repository: Repository<UserDocument>;
  private pageSize: number;
  private userBusinessModel: User;

  constructor(repository: Repository<UserDocument>) {
    this.repository = repository;
    this.pageSize = 20;
    this.userBusinessModel = new User(repository);
  }

  @Get('/')
  public async getAll(req: Request, res: Response) {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : this.pageSize;
    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;

    const dto: UserGetDTO = {
      pageNumber,
      pageSize,
      filter: req.query.filter,
      path: req.path
    };

    const response = await this.userBusinessModel.getAllUsers(dto);
    res.send(response);
  }

  @Get('/:id')
  public async get(req: Request, res: Response) {
    if (!req.params.id) {
      throw new MissingFieldError('id');
    }

    const user = await this.repository.getById(getValidObjectId(req.params.id));
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

    const dto: UserCreateDTO = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    };

    await this.userBusinessModel.createUser(dto);

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

    const dto: UserUpdateEmailDTO = {
      id: getValidObjectId(req.params.id),
      newEmail: req.body.email,
    };

    await this.userBusinessModel.updateEmail(dto);

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

    const dto: UserUpdatePasswordDTO = {
      id: getValidObjectId(req.params.id),
      password: req.body.password
    };

    await this.userBusinessModel.updatePassword(dto);

    res.sendStatus(204);
  }

}
