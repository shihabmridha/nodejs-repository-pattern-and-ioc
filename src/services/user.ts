import * as bcrypt from 'bcrypt';
// import { BadRequestError, MissingFieldError } from '../libs/app.errors';
// import Constants from '../constants';
// import UserRepository, { UserDocument } from '../repositories/user.repository';
// import IUserService from '../interfaces/user.service.interface';
// import { UserCreateDto } from '../dtos/user.dto';
// import isEmail from 'validator/lib/isEmail';
// import isLength from 'validator/lib/isLength';

import { UserDto } from '../dtos/user';
import { IUserService } from '../interfaces/services/user';
import { UserRepository } from '../repositories/user';
import { BadRequest } from '../libs/errors';
import { Mapper } from '../libs/mapper';

export default class UserService implements IUserService {
  private readonly _userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this._userRepository = userRepository;
  }

  private async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(5);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
  }

  async create(data: UserDto): Promise<void> {
    const user = await this._userRepository.isEmailExists(data.email);
    if (user) {
      throw new BadRequest('Email already exists');
    }

    const password = await this.hashPassword(data.password);
    const userData: UserDto = {
      ...data,
      password,
    };

    await this._userRepository.create(userData);
  }

  async getById(id: string): Promise<UserDto> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new BadRequest('User not found');
    }

    const dto = Mapper.entityToDto(UserDto, user);
    return dto;
  }
}
