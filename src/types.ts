import { Request } from 'express';
import { User } from './models/user.model';

/**
 * Introduce custom types here.
 */
export interface AppRequest extends Request {
  user: User;
}

/**
 * InversifyJS need to use the type as identifiers at runtime.
 * We use symbols as identifiers but you can also use classes and or string literals.
 */
export const TYPES = {
  BaseRepository: Symbol('BaseRepository'),
  BaseController: Symbol('BaseController'),
};
