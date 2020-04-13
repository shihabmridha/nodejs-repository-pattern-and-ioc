import { Request, Response } from 'express';
import { Types } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import { BadRequestError, MissingFieldError, NotFoundError } from '../../appErrors';
import { StaticStringKeys } from '../../statisString';
import * as Environment from '../../environments';
import { User, NormalizedUser, UserDocument } from '../../models/user.model';
import { getUserRepository } from '../../repositories/user.repository';

export enum USER_ROLE {
  ADMIN = 1,
  MODERATOR = 2,
  VISITOR = 3
}

/**
 * Create user
 * @requires username An unique user name
 * @requires password A valid password
 * @requires email A valid email
 **/
export async function createUser(req: Request, res: Response) {

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

  const repository = getUserRepository();

  const normalizedEmail = repository.normalizeEmail(req.body.email);
  const normalizedUsername = repository.normalizeUsername(req.body.username);

  const users = await repository.find({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] }, 2);

  users.forEach((user) => {
    if (user.email === normalizedEmail) {
      throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
    }

    if (user.username === normalizedUsername) {
      throw new BadRequestError(StaticStringKeys.USERNAME_NOT_AVAILABLE);
    }
  });

  const password = await repository.hashPassword(req.body.password);

  const userData = {
    username: normalizedUsername,
    email: normalizedEmail,
    password
  };

  await repository.create(userData);

  res.sendStatus(201);
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response) {
  const repository = getUserRepository();

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new BadRequestError('Invalid user id');
  }

  const user = await repository.get(req.params.id);

  if (!user) {
    throw new NotFoundError(StaticStringKeys.USER_NOT_FOUND);
  }

  const normalizedUser = repository.normalizeUser(user);

  res.send(normalizedUser);
}

/**
 * Get all users
 */
export async function getAllUsers(req: Request, res: Response) {
  const repository = getUserRepository();

  const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
  const pageNumber = req.query.page ? parseInt(req.query.page) : 1;

  const users = await repository.getAll(perPage, pageNumber);
  if (!users) {
    throw new NotFoundError('No user found');
  }

  const normalizedUsers: NormalizedUser[] = [];

  users.forEach((user: User) => {
    normalizedUsers.push(repository.normalizeUser(user));
  });

  res.send({
    users: normalizedUsers,
    perPage,
    pageNumber,
    next: normalizedUsers.length < perPage ? '' : `${Environment.BASE_URL}${req.path}?page=${pageNumber + 1}`,
    previous: (pageNumber > 1) ? `${Environment.BASE_URL}${req.path}?page=${pageNumber - 1}` : ''
  });
}

/**
 * Update email
 */
export async function updateEmail(req: Request, res: Response) {
  if (!req.params.id) {
    throw new MissingFieldError('id');
  }

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new BadRequestError('Invalid id');
  }

  if (!req.body.email) {
    throw new MissingFieldError('email');
  }

  if (!isEmail(req.body.email)) {
    throw new BadRequestError(StaticStringKeys.INVALID_EMAIL);
  }

  const repository = getUserRepository();

  const user = await repository.get(req.params.id) as UserDocument;

  if (req.body.email !== user.email) {
    const normalizedEmail = repository.normalizeEmail(req.body.email);
    const isEmailAvailable = await repository.isEmailAvailable(normalizedEmail);

    if (!isEmailAvailable) {
      throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
    }

    await repository.updateEmail(user._id, normalizedEmail);
  }

  res.sendStatus(204);
}

/**
 * Update password
 */
export async function updatePassword(req: Request, res: Response) {
  if (!req.params.id) {
    throw new MissingFieldError('id');
  }

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new BadRequestError('Invalid id');
  }

  if (!req.body.password) {
    throw new MissingFieldError('password');
  }

  const repository = getUserRepository();

  const newPassword = await repository.hashPassword(req.body.password);

  await repository.updatePassword(req.params.id, newPassword);

  res.sendStatus(204);
}

/**
 * Delete user
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  if (!req.params.id) {
    throw new MissingFieldError('id');
  }

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new BadRequestError('Invalid id');
  }

  const repository = getUserRepository();
  await repository.remove(req.params.id);

  res.sendStatus(204);
}
