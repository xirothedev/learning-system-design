import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { getRabbitMQMicroserviceOptions } from './queue/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<RmqOptions>(getRabbitMQMicroserviceOptions());

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
