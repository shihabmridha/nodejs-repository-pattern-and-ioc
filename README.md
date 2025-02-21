### !! Work in progress

# Repository pattern & Dependency injection using TypeScript

This starter kit tries to implement a NodeJS, ExpressJS and MongoDB powered web application using repository pattern and dependency injection. The main idea is independent of any framework or database. TypeScript is used instead of JavaScript for various reasons. Especially the support for interface, generic type support, and better IntelliSense.

# Usage

- Install required modules (`pnpm install`)
- Run (`pnpm start`)
- Go to `http://localhost:3000`. You should see a static html page.

Note: Run `pnpm run start:dev` for hot-reload.

# Core Features

- Dependency injection
- Repository pattern
- CI (with code coverage) using Azure DevOps

## Dependency injection using InversifyJS (Removed)

InversifyJS was making more abstraction than needed. I decided to remove it.

## Repository pattern

Main purpose is to decoupte database from business logic. If you ever decide to change the databse then you only need to update repositories. The base repository is `src/core/repository.ts`. All other repositores should be derived from it (Ex: `user.repository.ts`).

## Continious integration

The Azure Pipeline uses `azure-pipelines.yml` configuration file. The value of `$(DB_PASSWORD), $(DB_USERNAME)` etc placeholders should be replaced by pipeline variables. It published both test and coverage result.

> This might not be the best implementation you have seen or might not follow all the principals.
