import { Request, Response } from 'express';
import { IUserService } from '../interfaces/services/user';
import { UserDto } from '../dtos/user';
import { Mapper } from '../libs/mapper';

export class UserController {
  private readonly _userService: IUserService;

  constructor(userService: IUserService) {
    this._userService = userService;
  }

  public async get(req: Request, res: Response): Promise<void> {
    const user = await this._userService.getById(req.params.id);
    res.send(user);
  }

  public async create(req: Request, res: Response) {
    const dto = Mapper.dtoToDto(UserDto, req.body);
    await this._userService.create(dto);

    res.sendStatus(201);
  }

  public async update(_req: Request, _res: Response): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async delete(_req: Request, _res: Response): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
