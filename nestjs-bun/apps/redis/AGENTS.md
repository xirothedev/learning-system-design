# AGENTS.md

## Purpose

This app is a small Redis showcase built with NestJS on the Bun runtime. The goal is not to build complex abstractions. The goal is to keep the code easy to read so others can quickly reuse practical examples based on the Bun Redis docs.

Source use cases: https://bun.com/docs/runtime/redis

## Current scope

The app currently showcases 3 use cases:

- `caching`
- `rate-limiting`
- `session-storage`

The root route `GET /` only returns the list of available showcases.

## Architecture

### Core files

- `src/app.controller.ts`
  Exposes HTTP routes for the showcases.
- `src/app.service.ts`
  Contains business logic for cache, rate limiting, and session storage.
- `src/app.type.ts`
  Contains request/response types and shared types.
- `src/app.constant.ts`
  Contains constants, TTL values, demo data, and showcase names.
- `src/redis/redis.service.ts`
  Thin wrapper around Bun's `RedisClient`.
- `src/redis/redis.module.ts`
  Exports `RedisService` so the app can inject it directly.

### Dependency style

The preferred style in this app is to inject `RedisService` directly, without token aliases or interface abstraction unless there is a real need.

Reasons:

- shorter code
- easier to read for a demo app
- avoids premature abstraction
- still easy to mock in tests with Nest provider overrides or constructor-level mocks

## Route map

### Showcases list

- `GET /`
  Returns `{ showcases: ['caching', 'rate-limiting', 'session-storage'] }`

### Caching

- `GET /cache/users/:id`

Flow:

1. Read key `user:${id}` from Redis.
2. If cached data exists, return `source: 'cache'`.
3. If not, read from the in-memory demo database (`DEMO_USERS`), store it in Redis with `SET ... EX`, then return `source: 'database'`.

Key pattern:

- `user:${id}`

Redis commands used:

- `GET`
- `SET key value EX ttl`
- `TTL`

### Rate limiting

- `POST /rate-limit/:actorId`

Flow:

1. Increment the counter with `INCR`.
2. If this is the first request in the window, set TTL with `EXPIRE`.
3. Return `allowed`, `requests`, `remaining`, and `retryAfterSeconds`.

Key pattern:

- `rate_limit:${actorId}`

Redis commands used:

- `INCR`
- `EXPIRE`
- `TTL`

### Session storage

- `POST /sessions/:sessionId`
- `GET /sessions/:sessionId`
- `DELETE /sessions/:sessionId`

Flow:

- Create: validate payload, store session JSON with `SET ... EX`
- Get: read JSON with `GET`, parse it, and return session + TTL
- Delete: remove the key with `DEL`

Key pattern:

- `session:${sessionId}`

Redis commands used:

- `SET key value EX ttl`
- `GET`
- `TTL`
- `DEL`

## Constants and data

In `src/app.constant.ts`:

- `SHOWCASES`
  Current showcase list
- `USER_CACHE_TTL_SECONDS`
  TTL for user cache
- `RATE_LIMIT_WINDOW_SECONDS`
  Rate-limit window
- `MAX_REQUESTS_PER_WINDOW`
  Maximum requests allowed in the window
- `DEFAULT_SESSION_TTL_SECONDS`
  Default session TTL
- `DEMO_USERS`
  Demo data for the caching showcase

When adding a new use case, prefer to:

- add constants to `app.constant.ts`
- add types to `app.type.ts`
- keep `app.service.ts` focused on logic only

## Redis runtime notes

`src/redis/redis.service.ts`:

- extends Bun's `RedisClient` directly
- connects through `REDIS_URL`, with fallback `redis://localhost:6379`
- uses `onModuleInit` to connect
- uses `onModuleDestroy` to close
- logs connect/disconnect events

If you change connection behavior, keep the lifecycle hooks intact because the app relies on the Nest module lifecycle to open and close the Redis connection correctly.

## Validation rules

`AppService` currently validates input with inline guard clauses. It does not use DTOs or `class-validator`.

Current rules:

- `actorId` must be present
- `sessionId` must be present
- `userId` in the session payload must be present
- `cartItems`, if provided, must be `string[]`
- `metadata`, if provided, must be `Record<string, string>`
- `ttlSeconds`, if provided, must be a positive integer

For this demo app, inline validation is enough. Move to DTOs only if the number of routes or payload shapes grows significantly.

## Testing strategy

### Unit tests

File: `src/app.service.spec.ts`

Goals:

- test the logic of each showcase
- avoid requiring a real Redis instance
- mock the dependency with an object that matches the Redis methods actually used

Notes:

- `AppService` injects `RedisService` directly, but unit tests can still pass a mock object with a type cast
- avoid importing Bun runtime values in tests unless truly necessary

### E2E tests

File: `test/app.e2e-spec.ts`

Goals:

- test the full HTTP flow of each showcase
- avoid depending on a real Redis server

Approach:

- create an in-memory Redis mock with state and TTL support
- inject the mock through the Nest testing module as `RedisService`

Flows currently verified:

- showcase list
- cache miss followed by cache hit
- rate limiting until the threshold is exceeded
- create/get/delete session lifecycle

### Jest Bun mock

Because `RedisService` imports `bun`, Jest needs module mapping so tests can run on Node/Jest without the real Bun runtime.

Relevant files:

- `test/mocks/bun.ts`
- `package.json`
- `test/jest-e2e.json`

If tests start failing with `Cannot find module 'bun'`, check this mapping first.

## Editing rules for future AI agents

- Keep the app small and demo-friendly.
- Do not add new abstractions unless there is a clear use case.
- Prefer the Bun Redis API directly over unnecessary wrappers.
- Keep types in `app.type.ts` and constants in `app.constant.ts`.
- When adding a new showcase:
  1. add its key to `SHOWCASES`
  2. add the route in the controller
  3. add the logic in the service
  4. add a unit test
  5. add an e2e test
  6. update the README
- Do not turn the root route into a complex overview; keep it as a very short entry point.
- In tests, prefer mocking Redis over requiring a real Redis instance for CI or local verification.

## Useful commands

```bash
# run app
REDIS_URL=redis://localhost:6379 bun run start:dev

# unit tests
bun run test -- --runInBand

# e2e tests
bun run test:e2e -- --runInBand

# typecheck
bun x tsc --noEmit -p tsconfig.json
```
