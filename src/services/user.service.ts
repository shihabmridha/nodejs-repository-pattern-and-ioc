import { injectable, inject } from 'inversify';
import * as bcrypt from 'bcrypt';
import paginate, { Pagination } from '../utils/pagination';
import { UserGetDTO, UserCreateDTO, UserUpdatePasswordDTO, UserUpdateEmailDTO } from '../dto/user.dto';
import { BadRequestError } from '../errors/app.errors';
import StaticStringKeys from '../constants';
import { UserDocument } from '../repositories/user.repository';
import { IUserRepository } from '../repositories/user.repository';
import { TYPES } from '../types';

/**
 * User without sensitive fields.
 * This is useful when returning data to client.
 */
export type NormalizedUserDocument = Pick<UserDocument, '_id' | 'username' | 'email' | 'lastLoggedIn'>;

/**
 * Interface for UserService
 */
export interface IUserService {
  createUser(data: UserCreateDTO): Promise<void>;
  getAllUsers(data: UserGetDTO): Promise<Pagination<UserDocument>>;
  updateEmail(data: UserUpdateEmailDTO): Promise<void>;
  updatePassword(data: UserUpdatePasswordDTO): Promise<void>;
  isValidPassword(userGivenPassword: string, storedPassword: string): Promise<boolean>;
  normalizeEmail(email: string): string;
  normalizeUsername(username: string): string;
  isValidUsername(username: string): boolean;
  isUsernameAvailable(username: string): Promise<boolean>;
  isEmailAvailable(givenEmail: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  normalizeUser(user: UserDocument): NormalizedUserDocument;
}

/**
 * The actual class that contains all the business logic related to users.
 * Controller sanitize/validate(basic) and sends data to this class methods.
 */
@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public async createUser(data: UserCreateDTO): Promise<void> {
    const normalizedEmail = this.normalizeEmail(data.email);
    const normalizedUsername = this.normalizeUsername(data.username);

    const users = await this.userRepository.find({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    }, 2);

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
      password,
    };

    await this.userRepository.create(userData);
  }

  public async getAllUsers(getUserDto: UserGetDTO): Promise<Pagination<UserDocument>> {
    let documents: UserDocument[];
    const filter = getUserDto.filter || {};
    documents = await this.userRepository.find(filter, getUserDto.limit, getUserDto.pageNumber);

    return paginate(documents, getUserDto.limit, getUserDto.pageNumber, getUserDto.path);
  }

  public async updatePassword(data: UserUpdatePasswordDTO) {
    const newPassword = await this.hashPassword(data.password);

    await this.userRepository.updateById(data.id, { password: newPassword });
  }

  public async updateEmail(data: UserUpdateEmailDTO) {
    const user = await this.userRepository.get(data.id);

    if (data.newEmail !== user.email) {
      const normalizedEmail = this.normalizeEmail(data.newEmail);
      const isEmailAvailable = await this.isEmailAvailable(normalizedEmail);

      if (!isEmailAvailable) {
        throw new BadRequestError(StaticStringKeys.EMAIL_NOT_AVAILABLE);
      }

      await this.userRepository.updateById(user._id, { email: normalizedEmail });
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

    const isExists = await this.userRepository.isUsernameExists(username);

    return isExists;
  }

  public async isEmailAvailable(givenEmail: string): Promise<boolean> {
    const email = this.normalizeEmail(givenEmail);

    const isExists = await this.userRepository.isEmailExists(email);

    return isExists;
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
