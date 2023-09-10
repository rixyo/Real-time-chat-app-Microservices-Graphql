import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let messageController: MessageController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [MessageService],
    }).compile();

    messageController = app.get<MessageController>(MessageController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(messageController.getHello()).toBe('Hello World!');
    });
  });
});
