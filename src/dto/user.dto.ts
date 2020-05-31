import BaseDTO from '../core/base.dto';

export interface UserCreateDTO extends BaseDTO {
  username: string;
  email: string;
  password: string;
}

export type UserQueryDTO = BaseDTO;
