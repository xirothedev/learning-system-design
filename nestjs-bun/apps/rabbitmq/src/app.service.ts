import { Injectable } from '@nestjs/common';
import { getRabbitMQConfig } from './queue/rabbitmq.config';

@Injectable()
export class AppService {
  getHello(): string {
    const config = getRabbitMQConfig();

    return `RabbitMQ app is running on queue "${config.queue}"`;
  }
}
