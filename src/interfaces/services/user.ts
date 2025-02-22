import { UserDto } from '../../dtos/user';

export interface IUserService {
  create(data: UserDto): Promise<void>;
  get(id: string): Promise<UserDto>;
}
