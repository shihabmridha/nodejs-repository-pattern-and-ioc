import RouteDefinition from './interfaces';
import { HTTP_TYPE } from './constants';

export const Controller = (prefix: string = ''): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('prefix', prefix, target);

    // Since routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }

  };
};

const MakeHttpReflect = (httpMehod: HTTP_TYPE, path: string, target: object, propertyKey: string) => {
  // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
  // To prevent any further validation simply set it to an empty array here.
  if (!Reflect.hasMetadata('routes', target.constructor)) {
    Reflect.defineMetadata('routes', [], target.constructor);
  }

  // Get the routes stored so far, extend it by the new route and re-set the metadata.
  const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];
  routes.push({ requestMethod: httpMehod, path, methodName: propertyKey });

  Reflect.defineMetadata('routes', routes, target.constructor);
};

export const Get = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    return MakeHttpReflect(HTTP_TYPE.GET, path, target, propertyKey);
  };
};

export const Post = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    return MakeHttpReflect(HTTP_TYPE.POST, path, target, propertyKey);
  };
};

export const Put = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    return MakeHttpReflect(HTTP_TYPE.PUT, path, target, propertyKey);
  };
};

export const Delete = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    return MakeHttpReflect(HTTP_TYPE.DELETE, path, target, propertyKey);
  };
};
