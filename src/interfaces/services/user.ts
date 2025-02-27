import { UserDto } from '../../dtos/user';

export interface IUserService {
  create(data: UserDto): Promise<void>;
  getById(id: string): Promise<UserDto>;
}
