import { injectable, inject } from 'inversify';
import * as bcrypt from 'bcrypt';
import { BadRequestError, MissingFieldError } from '../common/app.errors';
import Constants from '../common/constants';
import UserRepository, { UserDocument } from './user.repository';
import TYPES from '../types';
import IUserService from './user.service.interface';
import { UserCreateDto } from './user.dto';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';

@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.UserRepository) private _userRepository: UserRepository;

  public normalizeEmail(email: string): string {
    return email.toLowerCase();
  }

  //#region Utility methods
  private async isValidUsername(username: string): Promise<boolean> {
    const length = username.length;
    const validLength = length >= 4 && length <= 30;

    if (!validLength) {
      return false;
    }

    const isAvailable = await this.isUsernameAvailable(username);

    return isAvailable;
  }

  private async isUsernameAvailable(username: string): Promise<boolean> {
    const isExists = await this._userRepository.isUsernameExists(username);

    return isExists;
  }

  private async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(5);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
  }
  //#endregion

  public async create(data: UserCreateDto): Promise<void> {
    if (!data.email) {
      throw new MissingFieldError('email');
    }

    if (!data.username) {
      throw new MissingFieldError('username');
    }

    if (!data.password) {
      throw new MissingFieldError('password');
    }

    if (!isEmail(data.email)) {
      throw new BadRequestError(Constants.INVALID_EMAIL);
    }

    if (!isLength(data.password.trim(), { min: 4, max: 20 })) {
      throw new BadRequestError(Constants.INVALID_PASSWORD);
    }

    const normalizedEmail = this.normalizeEmail(data.email);

    this.isValidUsername(data.username);

    const users = await this._userRepository.find({
      $or: [{ username: data.username }, { email: normalizedEmail }],
    });

    users.forEach((user) => {
      if (user.email === normalizedEmail) {
        throw new BadRequestError(Constants.EMAIL_NOT_AVAILABLE);
      }

      if (user.username === data.username) {
        throw new BadRequestError(Constants.USERNAME_NOT_AVAILABLE);
      }
    });

    const password = await this.hashPassword(data.password);

    const userData: UserCreateDto = {
      username: data.username,
      email: normalizedEmail,
      password,
    };

    await this._userRepository.create(userData);
  }

  public async get(id: string): Promise<UserDocument> {
    if (!id) {
      throw new MissingFieldError('id');
    }

    const user = await this._userRepository.findById(id);
    return user;
  }

  // TODO: Add pagination
  public async getAll(): Promise<UserDocument[]> {
    const documents = await this._userRepository.find({});

    return documents;
  }
}
