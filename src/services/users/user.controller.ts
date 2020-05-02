import { Request, Response } from 'express';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import { BadRequestError, MissingFieldError } from '../../appErrors';
import { User, UserDocument } from '../../models/user.model';
import { getUserRepository, UserRepository } from '../../repositories/user.repository';
import StaticStringKeys from '../../statisString';
import Service from '../service';

export enum USER_ROLE {
  ADMIN = 1,
  MODERATOR = 2,
  VISITOR = 3
}

export class UserController extends Service<UserDocument, User> {
  private userRepository: UserRepository;

  constructor(repository: UserRepository) {
    super(repository);

    this.userRepository = repository;
  }

  /**
   * Create user
   * @requires username An unique user name
   * @requires password A valid password
   * @requires email A valid email
   **/
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

    const normalizedEmail = this.userRepository.normalizeEmail(req.body.email);
    const normalizedUsername = this.userRepository.normalizeUsername(req.body.username);

    const users = await this.userRepository.find({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] }, 2);

    users.forEach((user) => {
      if (user.email === normalizedEmail) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      if (user.username === normalizedUsername) {
        throw new BadRequestError(StaticStringKeys.USERNAME_NOT_AVAILABLE);
      }
    });

    const password = await this.userRepository.hashPassword(req.body.password);

    const userData = {
      username: normalizedUsername,
      email: normalizedEmail,
      password
    };

    await this.userRepository.create(userData);

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

    const user = await this.userRepository.get(req.params.id) as UserDocument;

    if (req.body.email !== user.email) {
      const normalizedEmail = this.userRepository.normalizeEmail(req.body.email);
      const isEmailAvailable = await this.userRepository.isEmailAvailable(normalizedEmail);

      if (!isEmailAvailable) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      await this.userRepository.updateEmail(user._id, normalizedEmail);
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
