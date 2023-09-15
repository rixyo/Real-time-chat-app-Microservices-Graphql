import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';
export type GettingDataFromCommunityService = {
  response: boolean;
};
@Controller()
export class MessageController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly messageService: MessageService,
  ) {}
  @EventPattern('response-from-community-service')
  async responseFromCommunityService(
    @Payload() data: GettingDataFromCommunityService,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.messageService.responseIsUserAndCommunityExitFromCommunityService(
        data,
      );
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('get-community-messages')
  async getCommunityMessages(
    @Payload() data: { communityId: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.messageService.sendCommunityMessageToCommunityServer(
        data.communityId,
      );
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('return-users-from-auth-service')
  async returnUsersFromAuthService(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.messageService.getUsersFromAuthService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
}
