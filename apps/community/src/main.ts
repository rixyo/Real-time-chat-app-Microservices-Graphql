import { NestFactory } from '@nestjs/core';
import { CommunityModule } from './community.module';

async function bootstrap() {
  const app = await NestFactory.create(CommunityModule);
  await app.listen(3000);
}
bootstrap();
