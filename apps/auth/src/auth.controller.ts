import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
export type GettingDataFromCommunityService = {
  userIds: string[];
};
export type UpdateCreatorCommunityId = {
  userId: string;
  communityId: string;
};
export type UpdateUserMessage = {
  senderId: string;
  receiverId: string;
  messageId: string;
};
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}
  @EventPattern('assign-user-to-community')
  async validatedUserForCommunity(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.assignUserToCommunity(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('get-community-users')
  async assignUserToCommunity(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.sendComunityUser(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('update-user')
  async updateUser(
    @Payload() data: UpdateCreatorCommunityId,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.updateUserForCommunity(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('getUsersByIdsFromMessageService')
  async getUsersByIdsFromMessageService(
    @Payload() data: GettingDataFromCommunityService,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.sendUsersToMessageService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
  @EventPattern('updateUserMessage')
  async updateUserMessage(
    @Payload() data: UpdateUserMessage,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.updateUserMessage(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
}
