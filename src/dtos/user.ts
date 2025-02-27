import {
  IsAlpha,
  IsEmail,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { BaseDto } from './base';

export class UserDto extends BaseDto {
  @IsAlpha()
  @IsOptional()
  name: string = '';

  @IsEmail()
  email: string = '';

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    minLowercase: 1,
  })
  password: string = '';
}
