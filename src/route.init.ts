import { Application } from 'express';
import RouteDefinition from './core/interfaces';
import { asyncWrap } from './helpers';
import UserController from './controllers/user.controller';
import { getUserRepository } from './repositories/user.repository';

/**
 * Configure all the services with the express application
 */
export default function (app: Application) {
  // Iterate over all our controllers and register our routes
  const UserControllerInstance = new UserController(getUserRepository());
  configureRoutes(app, UserControllerInstance, UserController);
}

function configureRoutes(app: Application, instance: object, controller: object) {
  // The prefix saved to our controller
  const prefix = Reflect.getMetadata('prefix', controller);
  // Our `routes` array containing all our routes for this controller
  const routes: RouteDefinition[] = Reflect.getMetadata('routes', controller);

  // Iterate over all routes and register them to our express application
  routes.forEach((route) => {
    // It would be a good idea at this point to substitute the `app[route.requestMethod]` with a `switch/case` statement
    // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
    // this should be enough for now.
    app[route.requestMethod](prefix + route.path, asyncWrap(instance[route.methodName].bind(instance)));
  });
}
