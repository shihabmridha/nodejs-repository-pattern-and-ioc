import { HTTP_TYPE } from './constants';

export default interface RouteDefinition {
  // Path to our route
  path: string;
  // HTTP Request method (get, post, ...)
  requestMethod: HTTP_TYPE;
  // Method name within our class responsible for this route
  methodName: string;
}
