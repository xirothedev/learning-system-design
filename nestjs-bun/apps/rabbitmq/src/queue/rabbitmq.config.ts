import { RmqOptions, Transport } from '@nestjs/microservices';

type RabbitMQRuntimeConfig = {
  urls: string[];
  queue: string;
  queueOptions: {
    durable: boolean;
  };
  noAck: boolean;
  prefetchCount: number;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const parseNumber = (value: string | undefined, fallback: number) => {
  if (value == null) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export const getRabbitMQConfig = (): RabbitMQRuntimeConfig => ({
  urls: (
    process.env.RABBITMQ_URLS ??
    process.env.RABBITMQ_URL ??
    'amqp://localhost:5672'
  )
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  queue: process.env.RABBITMQ_QUEUE ?? 'demo_queue',
  queueOptions: {
    durable: parseBoolean(process.env.RABBITMQ_QUEUE_DURABLE, true),
  },
  noAck: parseBoolean(process.env.RABBITMQ_NO_ACK, false),
  prefetchCount: parseNumber(process.env.RABBITMQ_PREFETCH_COUNT, 1),
});

export const getRabbitMQMicroserviceOptions = (): RmqOptions => ({
  transport: Transport.RMQ,
  options: getRabbitMQConfig(),
});
