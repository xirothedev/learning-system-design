import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { RedisService } from './../src/redis/redis.service';

type StoredValue = {
  expiresAt: number | null;
  value: string;
};

type CachedUserResponse = {
  cacheKey: string;
  source: 'database' | 'cache';
  user: {
    id: string;
    name: string;
  };
};

const createRedisMock = () => {
  const store = new Map<string, StoredValue>();

  const read = (key: string) => {
    const entry = store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }

    return entry;
  };

  return {
    get: jest.fn((key: string) => read(key)?.value ?? null),
    set: jest.fn((key: string, value: string, _mode: 'EX', seconds: number) => {
      store.set(key, {
        value,
        expiresAt: Date.now() + seconds * 1000,
      });

      return Promise.resolve('OK' as const);
    }),
    ttl: jest.fn((key: string) => {
      const entry = read(key);
      if (!entry) {
        return Promise.resolve(-2);
      }

      if (entry.expiresAt === null) {
        return Promise.resolve(-1);
      }

      return Promise.resolve(
        Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000)),
      );
    }),
    incr: jest.fn((key: string) => {
      const entry = read(key);
      const nextValue = Number.parseInt(entry?.value ?? '0', 10) + 1;

      store.set(key, {
        value: String(nextValue),
        expiresAt: entry?.expiresAt ?? null,
      });

      return Promise.resolve(nextValue);
    }),
    expire: jest.fn((key: string, seconds: number) => {
      const entry = read(key);
      if (!entry) {
        return Promise.resolve(0);
      }

      store.set(key, {
        value: entry.value,
        expiresAt: Date.now() + seconds * 1000,
      });

      return Promise.resolve(1);
    }),
    del: jest.fn((...keys: string[]) => {
      let deleted = 0;

      for (const key of keys) {
        if (store.delete(key)) {
          deleted += 1;
        }
      }

      return Promise.resolve(deleted);
    }),
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let redisServiceMock: ReturnType<typeof createRedisMock>;

  beforeEach(async () => {
    redisServiceMock = createRedisMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists the available showcases', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        showcases: ['caching', 'rate-limiting', 'session-storage'],
      });
  });

  it('shows the caching flow from database to Redis', async () => {
    const server = app.getHttpServer();

    const firstResponse = await request(server)
      .get('/cache/users/1')
      .expect(200);
    const firstBody = firstResponse.body as CachedUserResponse;
    expect(firstBody.source).toBe('database');
    expect(firstBody.cacheKey).toBe('user:1');
    expect(firstBody.user.name).toBe('Ada Lovelace');

    const secondResponse = await request(server)
      .get('/cache/users/1')
      .expect(200);
    const secondBody = secondResponse.body as CachedUserResponse;
    expect(secondBody.source).toBe('cache');
    expect(secondBody.cacheKey).toBe('user:1');
    expect(redisServiceMock.set).toHaveBeenCalledTimes(1);
  });

  it('shows the rate limiting flow with Redis counters', async () => {
    const server = app.getHttpServer();

    for (let requestCount = 1; requestCount <= 10; requestCount += 1) {
      const response = await request(server)
        .post('/rate-limit/demo-client')
        .expect(201);
      expect(response.body).toMatchObject({
        useCase: 'rate-limiting',
        actorId: 'demo-client',
        allowed: true,
        requests: requestCount,
      });
    }

    const limitedResponse = await request(server)
      .post('/rate-limit/demo-client')
      .expect(201);
    expect(limitedResponse.body).toMatchObject({
      useCase: 'rate-limiting',
      actorId: 'demo-client',
      allowed: false,
      requests: 11,
      remaining: 0,
    });
  });

  it('shows the session storage lifecycle', async () => {
    const server = app.getHttpServer();

    const createResponse = await request(server)
      .post('/sessions/session-1')
      .send({
        userId: 'user-1',
        cartItems: ['book', 'pen'],
        metadata: { region: 'apac' },
        ttlSeconds: 120,
      })
      .expect(201);
    expect(createResponse.body).toMatchObject({
      useCase: 'session-storage',
      sessionKey: 'session:session-1',
      ttlSeconds: 120,
    });

    const getResponse = await request(server)
      .get('/sessions/session-1')
      .expect(200);
    expect(getResponse.body).toMatchObject({
      useCase: 'session-storage',
      sessionKey: 'session:session-1',
      ttlSeconds: 120,
      session: {
        sessionId: 'session-1',
        userId: 'user-1',
        cartItems: ['book', 'pen'],
        metadata: { region: 'apac' },
      },
    });

    await request(server).delete('/sessions/session-1').expect(200, {
      useCase: 'session-storage',
      sessionKey: 'session:session-1',
      deleted: true,
    });

    await request(server).get('/sessions/session-1').expect(404);
  });
});
