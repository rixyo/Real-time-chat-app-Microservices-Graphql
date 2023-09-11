import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
export type GettingDataFromCommunityService = {
  userIds: string[];
};
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}
  @EventPattern('assign-user-to-community')
  async assignUserToCommunity(
    @Payload() data: GettingDataFromCommunityService,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.authService.assignUserToCommunity(data);
      this.rmqService.ack(context);
    } catch (error) {
      console.log(error);
    }
  }
}
