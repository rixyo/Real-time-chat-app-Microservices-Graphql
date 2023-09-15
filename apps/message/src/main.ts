import { NestFactory } from '@nestjs/core';
import { MessageModule } from './message.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common';
async function bootstrap() {
  const app = await NestFactory.create(MessageModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will remove any additional properties that are not in the input
      forbidNonWhitelisted: true, // this will throw an error if there are any additional properties that are not in the input
      transform: true, // this will transform the incoming data to the type of the input
    }),
  );
  await app.listen(3002);
  app.connectMicroservice(rmqService.getOptions('MESSAGE'));
  await app.startAllMicroservices();
  Logger.log('Message microservice is listening at ' + 3002);
}
bootstrap();
