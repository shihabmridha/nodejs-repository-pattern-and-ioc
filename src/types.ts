import { Request } from 'express';
import { UserDocument } from './models/user.model';
import { HTTP_TYPE } from './constants';

/**
 * Introduce custom types here.
 */
export interface AppRequest extends Request {
  user: UserDocument;
}

/**
 * Route informations are stored in this format as metadata using decorator.
 */
export interface RouteDefinition {
  // Path to our route
  path: string;
  // HTTP Request method (get, post, ...)
  requestMethod: HTTP_TYPE;
  // Method name within our class responsible for this route
  methodName: string;
}

/**
 * InversifyJS need to use the type as identifiers at runtime.
 * We use symbols as identifiers but you can also use classes and or string literals.
 */
export const TYPES = {
  BaseRepository: Symbol('BaseRepository'),
  BaseController: Symbol('BaseController'),
};
