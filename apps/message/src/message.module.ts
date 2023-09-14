import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
  imports: [],
  providers: [MessageService],
})
export class MessageModule {}
