# Redis showcase with NestJS + Bun

This app implements 3 example use cases from the Bun Redis docs:

- Caching
- Rate limiting
- Session storage

Source: https://bun.com/docs/runtime/redis

## Table of Contents

- [Run](#run)
- [Showcases](#showcases)
- [Tests](#tests)

## Run

```bash
bun install
REDIS_URL=redis://localhost:6379 bun run start:dev
```

## Showcases

### 1. Caching

```bash
curl http://localhost:3000/cache/users/1
curl http://localhost:3000/cache/users/1
```

The first request returns data from the "database", and the second request returns it from the "cache".

### 2. Rate limiting

```bash
curl -X POST http://localhost:3000/rate-limit/demo-client
```

Redis uses `INCR` + `EXPIRE` to keep a request counter inside a 60-second window.

### 3. Session storage

```bash
curl -X POST http://localhost:3000/sessions/session-1 \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-1","cartItems":["book","pen"],"metadata":{"region":"apac"},"ttlSeconds":120}'

curl http://localhost:3000/sessions/session-1
curl -X DELETE http://localhost:3000/sessions/session-1
```

Redis uses `SET ... EX` to store a session with TTL.

## Tests

```bash
bun run test -- --runInBand
bun run test:e2e -- --runInBand
```

`app.service.spec.ts` tests the logic of each showcase. `app.e2e-spec.ts` tests the full endpoint flow using a stateful in-memory Redis mock with TTL support.
