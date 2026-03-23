import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitMQService } from './queue/rabbitmq.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('messages')
  async publishMessage(@Body() body: Record<string, unknown>) {
    const { pattern, ...payload } = body;
    const resolvedPattern = typeof pattern === 'string' ? pattern : undefined;

    await this.rabbitMQService.emit(payload, resolvedPattern);

    return {
      queued: true,
      pattern: resolvedPattern ?? 'demo.created',
      payload,
    };
  }
}
