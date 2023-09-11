import { NestFactory } from '@nestjs/core';
import { CommunityModule } from './community.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(CommunityModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will remove any additional properties that are not in the input
      forbidNonWhitelisted: true, // this will throw an error if there are any additional properties that are not in the input
      transform: true, // this will transform the incoming data to the type of the input
    }),
  );
  await app.listen(3001);
  app.connectMicroservice(rmqService.getOptions('COMMUNITY'));
  await app.startAllMicroservices();
  Logger.log('Community microservice is listening at ' + 3001);
}
bootstrap();
