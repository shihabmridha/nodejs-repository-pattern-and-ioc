import { ObjectId } from 'mongodb';
import { UserCreateDto } from './user.dto';
import { UserDocument } from './user.repository';

export default interface IUserService {
  create(data: UserCreateDto): Promise<void>;
  getAll(): Promise<UserDocument[]>;
  get(id: ObjectId): Promise<UserDocument>;
}
