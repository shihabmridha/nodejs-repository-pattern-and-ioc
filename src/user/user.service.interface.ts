import { Pagination } from "../common/utils/pagination";
import { UserCreateDto, UserQueryDto, UserUpdateEmailDto, UserUpdatePasswordDto } from "./user.dto";
import { UserDocument } from "./user.repository";
import { NormalizedUserDocument } from "./user.service";

export default interface IUserService {
    createUser(data: UserCreateDto): Promise<void>;
    getAllUsers(data: UserQueryDto): Promise<Pagination<UserDocument>>;
    updateEmail(data: UserUpdateEmailDto): Promise<void>;
    updatePassword(data: UserUpdatePasswordDto): Promise<void>;
    isValidPassword(
      userGivenPassword: string,
      storedPassword: string,
    ): Promise<boolean>;
    normalizeEmail(email: string): string;
    normalizeUsername(username: string): string;
    isValidUsername(username: string): boolean;
    isUsernameAvailable(username: string): Promise<boolean>;
    isEmailAvailable(givenEmail: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
    normalizeUser(user: UserDocument): NormalizedUserDocument;
  }