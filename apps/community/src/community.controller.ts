import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { CommunityService } from './community.service';
import { UserType } from '@app/common/type/user.type';
export type GettingDataFromAuthService = {
  users: UserType[];
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
      this.communityService.receiveUsersFromAuthService(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
}