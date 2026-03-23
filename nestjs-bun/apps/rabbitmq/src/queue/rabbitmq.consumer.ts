import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RABBITMQ_DEFAULT_PATTERN } from './rabbitmq.constants';

type RabbitMQAckChannel = {
  ack(message: unknown): void;
};

@Controller()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  @EventPattern(RABBITMQ_DEFAULT_PATTERN)
  handleDemoCreated(
    @Payload() payload: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `Received ${RABBITMQ_DEFAULT_PATTERN}: ${JSON.stringify(payload)}`,
    );

    const channel = context.getChannelRef() as RabbitMQAckChannel;
    const message = context.getMessage();

    // Nest exposes the RMQ channel through a weakly typed context API.

    channel.ack(message);
  }
}
