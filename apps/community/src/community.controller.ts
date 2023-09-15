import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityMessageTypeFromCommunity } from './types/community.message.type';
export type GettingDataFromAuthService = {
  userIds: string[];
};
export type GettingCommunityAndUserId = {
  communityId: string;
  userId: string;
};
export type GettingDataFromMessageService = {
  messageId: string;
  communityId: string;
};
export type ResponseFromMessageServiceWithMessages = {
  messages: CommunityMessageTypeFromCommunity[];
};
@Controller()
export class CommunityController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly communityService: CommunityService,
  ) {}
  @EventPattern('return-users-from-auth-service')
  async assignUserToCommunity(
    @Payload() data: GettingDataFromAuthService,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.communityService.receiveUsersIdFromAuthService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('return-community-users-from-auth-service')
  async getUsersFromAuthService(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.communityService.receiveUsersFromAuthService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('checkIfUserIsInCommunity')
  async checkIfUserIsInCommunity(
    @Payload() data: GettingCommunityAndUserId,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.communityService.checkIfUserIsInCommunity(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('sendCommunityMessagesWithUsers')
  async GetCommunityMessage(
    @Payload() data: ResponseFromMessageServiceWithMessages,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.communityService.getCommunityMessagesFromMessageService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('sendMessageToCommunity')
  async updateCommunityMessage(
    @Payload() data: GettingDataFromMessageService,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.communityService.updateCommunityMessage(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
}
