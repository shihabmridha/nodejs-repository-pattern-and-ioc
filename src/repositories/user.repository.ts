import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserModel, User, UserDocument, NormalizedUser } from '../models/user.model';
import { Repository, Query, Projection } from './repository';
import { InvalidIdError, RepositoryMissingField } from '../appErrors';

export class UserRepository extends Repository<UserDocument, User> {

  public async getUserByEmail(email: string, project?: Projection): Promise<User> {
    const query: Query<User> = { email };

    const user = await this.find(query, 1, project);

    return user[0];
  }

  public async updateEmail(id: string, email: string): Promise<void> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    if (!email) {
      throw new RepositoryMissingField();
    }

    const model = this.getModel();
    await model.findByIdAndUpdate(id, { email }).exec();
  }

  public async updatePassword(id: string, password: string): Promise<void> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new InvalidIdError();
    }

    if (!password) {
      throw new RepositoryMissingField();
    }

    const model = this.getModel();
    await model.findByIdAndUpdate(id, { password }).exec();
  }

  public async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(5);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
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

  public normalizeUsername(username: string): string {
    return username.toLowerCase().replace(/ /g, '_').replace(/[^A-Za-z0-9_]/g, '');
  }

  public normalizeEmail(email: string): string {
    return email.toLowerCase();
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

    const user = await this.find({ username }, 1, { _id: 1 });

    if (user.length > 0) {
      return false;
    }

    return true;
  }

  public async isEmailAvailable(givenEmail: string): Promise<boolean> {
    const email = this.normalizeEmail(givenEmail);

    const user = await this.find({ email }, 1, { _id: 1 });

    if (user.length > 0) {
      return false;
    }

    return true;
  }

  public normalizeUser(user: User): NormalizedUser {
    const normalizedUser = user as UserDocument;

    normalizedUser.id = normalizedUser._id;
    normalizedUser._id = undefined;
    normalizedUser.__v = undefined;
    normalizedUser.password = undefined;
    normalizedUser.role = undefined;
    normalizedUser.deletedAt = undefined;

    return normalizedUser;
  }

}

/**
 * Use this factory method to get a UserRepository instance instead of directly instantiating it
 * because it may have more dependency in future and instantiating in many places will make it harder to add any new dependency
 */
let repository: UserRepository = null;
export function getUserRepository() {
  if (!repository) {
    repository = new UserRepository(UserModel);
  }

  return repository;
}
