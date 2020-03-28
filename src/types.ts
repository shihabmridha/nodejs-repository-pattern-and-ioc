import { Request } from 'express';
import { User } from './models/user.model';

/**
 * Introduce custom types here.
 */
export interface AppRequest extends Request {
  user: User;
}
