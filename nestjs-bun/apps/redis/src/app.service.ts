import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_SESSION_TTL_SECONDS,
  DEMO_USERS,
  MAX_REQUESTS_PER_WINDOW,
  RATE_LIMIT_WINDOW_SECONDS,
  SHOWCASES,
  USER_CACHE_TTL_SECONDS,
} from './app.constant';
import type {
  CachedUserResponse,
  CreateSessionBody,
  DeleteSessionResponse,
  DemoUser,
  RateLimitResponse,
  SessionRecord,
  SessionResponse,
  ShowcaseListResponse,
} from './app.type';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getShowcases(): ShowcaseListResponse {
    return { showcases: SHOWCASES };
  }

  async getCachedUser(id: number): Promise<CachedUserResponse> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) {
      return {
        useCase: 'caching',
        source: 'cache',
        cacheKey,
        ttlSeconds: await this.redisService.ttl(cacheKey),
        user: this.parseJson<DemoUser>(cachedUser, 'cached user'),
      };
    }

    const user = await this.fetchUserFromDatabase(id);
    await this.redisService.set(
      cacheKey,
      JSON.stringify(user),
      'EX',
      USER_CACHE_TTL_SECONDS,
    );

    return {
      useCase: 'caching',
      source: 'database',
      cacheKey,
      ttlSeconds: USER_CACHE_TTL_SECONDS,
      user,
    };
  }

  async checkRateLimit(actorId: string): Promise<RateLimitResponse> {
    if (!actorId.trim()) {
      throw new BadRequestException('actorId is required');
    }

    const rateLimitKey = `rate_limit:${actorId}`;
    const requests = await this.redisService.incr(rateLimitKey);

    if (requests === 1) {
      await this.redisService.expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
    }

    const ttlSeconds = await this.redisService.ttl(rateLimitKey);
    const allowed = requests <= MAX_REQUESTS_PER_WINDOW;

    return {
      useCase: 'rate-limiting',
      actorId,
      allowed,
      requests,
      remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - requests),
      retryAfterSeconds:
        ttlSeconds > 0 ? ttlSeconds : RATE_LIMIT_WINDOW_SECONDS,
    };
  }

  async createSession(
    sessionId: string,
    payload: CreateSessionBody,
  ): Promise<SessionResponse> {
    if (!sessionId.trim()) {
      throw new BadRequestException('sessionId is required');
    }

    if (!payload?.userId?.trim()) {
      throw new BadRequestException('userId is required');
    }

    if (
      payload.cartItems &&
      !payload.cartItems.every((item) => typeof item === 'string')
    ) {
      throw new BadRequestException('cartItems must be an array of strings');
    }

    if (payload.metadata && !this.isStringRecord(payload.metadata)) {
      throw new BadRequestException(
        'metadata must be an object with string values',
      );
    }

    const ttlSeconds = payload.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new BadRequestException('ttlSeconds must be a positive integer');
    }

    const session: SessionRecord = {
      sessionId,
      userId: payload.userId,
      cartItems: payload.cartItems ?? [],
      metadata: payload.metadata ?? {},
      lastActiveAt: new Date().toISOString(),
    };

    const sessionKey = `session:${sessionId}`;
    await this.redisService.set(
      sessionKey,
      JSON.stringify(session),
      'EX',
      ttlSeconds,
    );

    return {
      useCase: 'session-storage',
      sessionKey,
      ttlSeconds,
      session,
    };
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const sessionKey = `session:${sessionId}`;
    const session = await this.redisService.get(sessionKey);

    if (!session) {
      throw new NotFoundException(`Session "${sessionId}" was not found`);
    }

    return {
      useCase: 'session-storage',
      sessionKey,
      ttlSeconds: await this.redisService.ttl(sessionKey),
      session: this.parseJson<SessionRecord>(session, 'session'),
    };
  }

  async deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
    const sessionKey = `session:${sessionId}`;
    const deletedCount = await this.redisService.del(sessionKey);

    return {
      useCase: 'session-storage',
      sessionKey,
      deleted: deletedCount === 1,
    };
  }

  private async fetchUserFromDatabase(id: number): Promise<DemoUser> {
    const user = DEMO_USERS[id];

    if (!user) {
      throw new NotFoundException(`User "${id}" was not found`);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
    return user;
  }

  private parseJson<T>(value: string, label: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      throw new BadRequestException(`Invalid JSON stored for ${label}`);
    }
  }

  private isStringRecord(value: Record<string, string>): boolean {
    return Object.values(value).every((item) => typeof item === 'string');
  }
}
