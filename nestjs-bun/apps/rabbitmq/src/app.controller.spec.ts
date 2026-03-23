import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQService } from './queue/rabbitmq.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RabbitMQService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return rabbitmq status', () => {
      expect(appController.getHello()).toBe(
        'RabbitMQ app is running on queue "demo_queue"',
      );
    });
  });
});
