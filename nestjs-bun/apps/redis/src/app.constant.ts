import type { DemoUser } from './app.type';

export const SHOWCASES = [
  'caching',
  'rate-limiting',
  'session-storage',
] as const;

export const USER_CACHE_TTL_SECONDS = 60;
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const MAX_REQUESTS_PER_WINDOW = 10;
export const DEFAULT_SESSION_TTL_SECONDS = 60 * 60;

export const DEMO_USERS: Record<number, DemoUser> = {
  1: { id: 1, name: 'Ada Lovelace', plan: 'pro' },
  2: { id: 2, name: 'Grace Hopper', plan: 'enterprise' },
  3: { id: 3, name: 'Linus Torvalds', plan: 'free' },
};
