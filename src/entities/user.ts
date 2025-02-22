import { BaseEntity } from './base';

export class UserEntity extends BaseEntity {
  public name: string = '';
  public email: string = '';
  public password: string = '';
}
