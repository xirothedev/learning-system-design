import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import type { RedisShowcaseClient } from './app.type';
import type { RedisService } from './redis/redis.service';

describe('AppService', () => {
  let appService: AppService;
  let redisService: jest.Mocked<RedisShowcaseClient>;

  beforeEach(() => {
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      ttl: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    } as jest.Mocked<RedisShowcaseClient>;

    appService = new AppService(redisService as unknown as RedisService);
  });

  it('returns cached users when present in Redis', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({ id: 1, name: 'Ada Lovelace', plan: 'pro' }),
    );
    redisService.ttl.mockResolvedValue(42);

    await expect(appService.getCachedUser(1)).resolves.toEqual({
      useCase: 'caching',
      source: 'cache',
      cacheKey: 'user:1',
      ttlSeconds: 42,
      user: { id: 1, name: 'Ada Lovelace', plan: 'pro' },
    });
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('returns the available showcases', () => {
    expect(appService.getShowcases()).toEqual({
      showcases: ['caching', 'rate-limiting', 'session-storage'],
    });
  });

  it('creates a rate-limit window on the first request', async () => {
    redisService.incr.mockResolvedValue(1);
    redisService.ttl.mockResolvedValue(60);

    await expect(appService.checkRateLimit('api-key-123')).resolves.toEqual({
      useCase: 'rate-limiting',
      actorId: 'api-key-123',
      allowed: true,
      requests: 1,
      remaining: 9,
      retryAfterSeconds: 60,
    });
    expect(redisService.expire).toHaveBeenCalledWith(
      'rate_limit:api-key-123',
      60,
    );
  });

  it('stores sessions with a Redis TTL', async () => {
    redisService.set.mockResolvedValue('OK');

    const result = await appService.createSession('session-1', {
      userId: 'user-1',
      cartItems: ['book'],
      metadata: { region: 'apac' },
      ttlSeconds: 120,
    });

    expect(result.useCase).toBe('session-storage');
    expect(result.ttlSeconds).toBe(120);
    expect(result.session.sessionId).toBe('session-1');
    expect(redisService.set).toHaveBeenCalledWith(
      'session:session-1',
      expect.any(String),
      'EX',
      120,
    );
  });

  it('throws when a session is missing', async () => {
    redisService.get.mockResolvedValue(null);

    await expect(appService.getSession('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('validates session payloads', async () => {
    await expect(
      appService.createSession('session-1', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-string userIds', async () => {
    await expect(
      appService.createSession('session-1', {
        userId: 123 as unknown as string,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-array cartItems payloads', async () => {
    await expect(
      appService.createSession('session-1', {
        userId: 'user-1',
        cartItems: 'book' as unknown as string[],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid metadata payloads', async () => {
    await expect(
      appService.createSession('session-1', {
        userId: 'user-1',
        metadata: 123 as unknown as Record<string, string>,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
