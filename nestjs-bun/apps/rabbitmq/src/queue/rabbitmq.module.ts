import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { getRabbitMQMicroserviceOptions } from './rabbitmq.config';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { RABBITMQ_CLIENT } from './rabbitmq.constants';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  controllers: [RabbitMQConsumer],
  providers: [
    {
      provide: RABBITMQ_CLIENT,
      useFactory: () =>
        ClientProxyFactory.create(getRabbitMQMicroserviceOptions()),
    },
    RabbitMQService,
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
