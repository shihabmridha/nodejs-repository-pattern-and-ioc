FROM node:22.14.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . /app

FROM base AS build

COPY pnpm-lock.yaml /app
RUN pnpm fetch
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
