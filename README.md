# Repository pattern & Dependency injection using TypeScript

### !! Work in progress

This starter kit tries to implement a NodeJS, ExpressJS and MongoDB powered web application using repository pattern and dependency injection. The main idea is independent of any framework or database. TypeScript is used instead of JavaScript for various reasons. Especially the support for interface, generic type support, and better IntelliSense.

# Usage
- Install TypeScript globally (`npm i -g typescript`)
- Install required modules (`npm install`)
- Compile typescript to javascript (`npm run compile`)
- Run (`npm start`)
- Go to `http://localhost:3000`. You should see a static html page.

# Core Features
- Dependency injection
- Repository pattern
- CI (with code coverage) using Azure DevOps

## Dependency injection using InversifyJS
[InversifyJS](http://inversify.io/) is a very useful library for dependency injection in JavaScript. It has first class support for TypeScript. It is not necessary to use interface to use dependency injection because Inversify can work with class. But, we should **"depend upon Abstractions and do not depend upon concretions"**. So we will use interfaces (abstractions). Everywhere in our application, we will only use (import) interfaces. In the `src/inversify.ts` file we will create a container, import necessary classes and do dependency bindings. InversifyJS requires a library named [reflect-metadata](https://www.npmjs.com/package/reflect-metadata).

## Repository pattern
Main purpose is to decoupte database from business logic. If you ever decide to change the databse then you only need to update repositories. The base repository is `src/repositories/repository.ts`. All other repositores should be derived from it (Ex: `user.repository.ts`).

## Continious integration
The Azure Pipeline uses `azure-pipelines.yml` configuration file. The value of `$(DB_PASSWORD), $(DB_USERNAME)` etc placeholders should be replaced by pipeline variables. It published both test and coverage result.


> This might not be the best implementation you have seen or might not follow all the principals.
