import BaseDTO from './base.dto';
import { Query } from '../repository';
import { ObjectID } from 'mongodb';

export type UserQueryDTO = BaseDTO;

export interface UserGetDTO extends BaseDTO {
  pageSize: number;
  pageNumber: number;
  filter: Query<UserQueryDTO>;
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
