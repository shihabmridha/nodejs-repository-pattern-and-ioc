import { BaseEntity } from '../entities/base';
import { BaseDto } from '../dtos/base';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export class Mapper {
  static dtoToEntity<T extends BaseEntity, K extends BaseDto>(
    classType: ClassConstructor<T>,
    plainObject: K,
  ): T;

  static dtoToEntity<T extends BaseEntity, K extends BaseDto>(
    classType: ClassConstructor<T>,
    plainObject: K[],
  ): T[];

  static dtoToEntity<T extends BaseEntity, K extends BaseDto>(
    classType: ClassConstructor<T>,
    plainObject: K,
  ): T | T[] {
    return Array.isArray(plainObject)
      ? plainObject.map((obj) =>
          plainToInstance(classType, obj, { excludeExtraneousValues: true }),
        )
      : plainToInstance(classType, plainObject, {
          excludeExtraneousValues: true,
        });
  }

  static entityToDto<T extends BaseDto, K extends BaseEntity>(
    classType: ClassConstructor<T>,
    plainObject: K,
  ): T;

  static entityToDto<T extends BaseDto, K extends BaseEntity>(
    classType: ClassConstructor<T>,
    plainObject: K[],
  ): T[];

  static entityToDto<T extends BaseDto, K extends BaseEntity>(
    classType: ClassConstructor<T>,
    plainObject: K | K[],
  ): T | T[] {
    return Array.isArray(plainObject)
      ? plainObject.map((obj) => plainToInstance(classType, obj))
      : plainToInstance(classType, plainObject);
  }

  static dtoToDto<T extends BaseDto, K extends BaseDto>(
    classType: ClassConstructor<T>,
    plainObject: K,
  ): T {
    return plainToInstance(classType, plainObject);
  }
}
