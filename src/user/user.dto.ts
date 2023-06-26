import { Filter, ObjectId } from 'mongodb';
import { UserDocument } from './user.repository';

export interface UserQueryDto {
  limit: number;
  pageNumber: number;
  filter: Filter<Partial<UserDocument>>;
  path: string;
}

export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdatePasswordDto {
  id: ObjectId;
  password: string;
}

export interface UserUpdateEmailDto {
  id: ObjectId;
  newEmail: string;
}
