# NestJS Bun Redis

A minimal Bun + Turborepo monorepo for learning Redis with NestJS.

## Table of Contents

- [Structure](#structure)
- [Quick commands](#quick-commands)
- [Next steps for learning Redis](#next-steps-for-learning-redis)

## Structure

- `apps/redis`: a NestJS API app created with the Nest CLI.

## Quick commands

Run these from the `nestjs-bun` directory:

```sh
bun run dev --filter=redis
bun run build --filter=redis
bun run lint --filter=redis
bun run check-types --filter=redis
```

Or run the app directly:

```sh
cd apps/redis
bun run start:dev
```

## Next steps for learning Redis

1. Install Redis locally or run it with Docker.
2. Add packages such as `ioredis` or `@nestjs/cache-manager`.
3. Build a dedicated Redis module and experiment with use cases such as caching, queues, rate limiting, and pub/sub.
