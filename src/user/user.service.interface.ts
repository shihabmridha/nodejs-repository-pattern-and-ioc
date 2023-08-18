import { UserCreateDto } from './user.dto';
import { UserDocument } from './user.repository';

export default interface IUserService {
  create(data: UserCreateDto): Promise<void>;
  getAll(): Promise<UserDocument[]>;
  get(id: string): Promise<UserDocument>;
}
