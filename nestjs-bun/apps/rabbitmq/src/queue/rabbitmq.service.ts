import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';
import {
  RABBITMQ_CLIENT,
  RABBITMQ_DEFAULT_PATTERN,
} from './rabbitmq.constants';

@Injectable()
export class RabbitMQService implements OnApplicationShutdown {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  async emit(
    payload: Record<string, unknown>,
    pattern = RABBITMQ_DEFAULT_PATTERN,
  ) {
    await firstValueFrom(
      this.client.emit(pattern, payload).pipe(defaultIfEmpty(undefined)),
    );
  }

  async onApplicationShutdown() {
    await this.client.close();
  }
}
