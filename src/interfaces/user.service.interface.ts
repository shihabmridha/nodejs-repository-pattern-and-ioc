import { UserCreateDto } from '../dtos/user.dto';
import { UserDocument } from '../repositories/user.repository';

export default interface IUserService {
  create(data: UserCreateDto): Promise<void>;
  getAll(): Promise<UserDocument[]>;
  get(id: string): Promise<UserDocument>;
}
