import type { RedisClient } from 'bun';

export type ResponseSource = 'cache' | 'database';

export type RedisShowcaseClient = Pick<
  RedisClient,
  'del' | 'expire' | 'get' | 'incr' | 'set' | 'ttl'
>;

export interface DemoUser {
  id: number;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  cartItems: string[];
  metadata: Record<string, string>;
  lastActiveAt: string;
}

export interface CreateSessionBody {
  userId?: string;
  cartItems?: string[];
  metadata?: Record<string, string>;
  ttlSeconds?: number;
}

export interface ShowcaseListResponse {
  showcases: readonly string[];
}

export interface CachedUserResponse {
  useCase: 'caching';
  source: ResponseSource;
  cacheKey: string;
  ttlSeconds: number;
  user: DemoUser;
}

export interface RateLimitResponse {
  useCase: 'rate-limiting';
  actorId: string;
  allowed: boolean;
  requests: number;
  remaining: number;
  retryAfterSeconds: number;
}

export interface SessionResponse {
  useCase: 'session-storage';
  sessionKey: string;
  ttlSeconds: number;
  session: SessionRecord;
}

export interface DeleteSessionResponse {
  useCase: 'session-storage';
  sessionKey: string;
  deleted: boolean;
}
