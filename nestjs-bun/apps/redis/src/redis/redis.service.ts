/// Reference: https://bun.com/docs/runtime/redis
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClient } from 'bun';

@Injectable()
export class RedisService extends RedisClient implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(RedisService.name);

  constructor() {
    super('redis://username:password@localhost:6379');

    this.onconnect = () => {
      this.logger.log('Connected to Redis');
    }

    this.onclose = () => {
      this.logger.warn('Disconnected from Redis');
    }
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    this.close();
  }
}
