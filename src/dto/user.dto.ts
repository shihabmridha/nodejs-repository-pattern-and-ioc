import BaseDTO from './base.dto';
import { ObjectID, FilterQuery } from 'mongodb';

export type UserQueryDTO = BaseDTO;

export interface UserGetDTO extends BaseDTO {
  limit: number;
  pageNumber: number;
  filter: FilterQuery<UserQueryDTO>;
  path: string;
}

export interface UserCreateDTO extends BaseDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdatePasswordDTO extends BaseDTO {
  id: ObjectID;
  password: string;
}

export interface UserUpdateEmailDTO extends BaseDTO {
  id: ObjectID;
  newEmail: string;
}
