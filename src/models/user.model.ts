import { ObjectID } from 'mongodb';
import * as bcrypt from 'bcrypt';
import Repository from '../repository';
import { UserGetDTO, UserCreateDTO, UserUpdatePasswordDTO, UserUpdateEmailDTO } from '../dto/user.dto';
import * as Environment from '../environments';
import { BadRequestError } from '../errors/app.errors';
import StaticStringKeys from '../constants';

/**
 * Document of user collection contains following fields.
 */
export interface UserDocument {
  _id: ObjectID;
  username: string;
  email: string;
  lastLoggedIn?: Date;
  password: string;
  role?: number;
  deletedAt?: Date;
  createdAt?: Date;
}

/**
 * User without sensitive fields.
 * This is useful when returning data to client.
 */
export type NormalizedUserDocument = Pick<UserDocument, '_id' | 'username' | 'email' | 'lastLoggedIn'>;

/**
 * The actual class that contains all the business logic related to users.
 * Controller sanitize/validate(basic) and sends data to this class methods.
 */
export default class User {

  private repository: Repository<UserDocument>;

  constructor(repository: Repository<UserDocument>) {
    this.repository = repository;
  }

  public async createUser(data: UserCreateDTO) {
    const normalizedEmail = this.normalizeEmail(data.email);
    const normalizedUsername = this.normalizeUsername(data.username);

    const users = await this.repository.find({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] }, 2);
    users.forEach((user) => {
      if (user.email === normalizedEmail) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      if (user.username === normalizedUsername) {
        throw new BadRequestError(StaticStringKeys.USERNAME_NOT_AVAILABLE);
      }
    });

    const password = await this.hashPassword(data.password);

    const userData: UserCreateDTO = {
      username: normalizedUsername,
      email: normalizedEmail,
      password
    };

    await this.repository.create(userData);
  }

  public async getAllUsers(data: UserGetDTO) {
    let documents: UserDocument[];
    if (data.filter) {
      documents = await this.repository.find(data, data.pageSize, data.pageNumber);
    } else {
      documents = await this.repository.getAll(data.pageSize, data.pageNumber);
    }

    return {
      users: documents,
      pageSize: data.pageSize,
      pageNumber: data.pageNumber,
      next: documents.length < data.pageSize ? '' : `${Environment.BASE_URL}${data.path}?page=${data.pageNumber + 1}`,
      previous: (data.pageNumber > 1) ? `${Environment.BASE_URL}${data.path}?page=${data.pageNumber - 1}` : ''
    };
  }

  public async updatePassword(data: UserUpdatePasswordDTO) {
    const newPassword = await this.hashPassword(data.password);

    await this.repository.updateById(data.id, { password: newPassword });
  }

  public async updateEmail(data: UserUpdateEmailDTO) {
    const user = await this.repository.getById(data.id);

    if (data.email !== user.email) {
      const normalizedEmail = this.normalizeEmail(data.email);
      const isEmailAvailable = await this.isEmailAvailable(normalizedEmail);

      if (!isEmailAvailable) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      await this.repository.updateById(user._id, { email: normalizedEmail });
    }
  }

  public async isValidPassword(userGivenPassword: string, storedPassword: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(userGivenPassword, storedPassword, function (err, isMatch: boolean) {
        if (err) {
          return reject(err);
        }
        resolve(isMatch);
      });
    });
  }

  public normalizeEmail(email: string): string {
    return email.toLowerCase();
  }

  public normalizeUsername(username: string): string {
    return username.toLowerCase().replace(/ /g, '_').replace(/[^A-Za-z0-9_]/g, '');
  }

  public isValidUsername(username: string): boolean {
    const usernameNormalized = this.normalizeUsername(username);
    const length = usernameNormalized.length;
    return length >= 4 && length <= 30;
  }

  public async isUsernameAvailable(username: string): Promise<boolean> {
    if (!this.isValidUsername(username)) {
      return false;
    }

    const user = await this.repository.find({ username }, 1, { _id: 1 });

    if (user.length > 0) {
      return false;
    }

    return true;
  }

  public async isEmailAvailable(givenEmail: string): Promise<boolean> {
    const email = this.normalizeEmail(givenEmail);

    const user = await this.repository.find({ email }, 1, { _id: 1 });

    if (user.length > 0) {
      return false;
    }

    return true;
  }

  public async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(5);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
  }

  public normalizeUser(user: UserDocument): NormalizedUserDocument {
    const normalizedUser = user;

    normalizedUser.password = undefined;
    normalizedUser.role = undefined;
    normalizedUser.deletedAt = undefined;

    return normalizedUser;
  }

}
