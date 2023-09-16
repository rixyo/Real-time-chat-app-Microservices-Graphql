import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { AuthGuard, CurrentUser, JWTUserType } from '@app/common';
import { UseGuards } from '@nestjs/common';
import { UserDirectMessageType } from '@app/common/type/directmessage.type';
import { directMessageInput } from './inputs/directmessage.input';
import { UserDirectMessageTypes } from './usermessage.type';

@Resolver((of) => UserDirectMessageType)
export class UserDirectMessageResolver {
  constructor(private messageService: MessageService) {}
  @Mutation((returns) => UserDirectMessageType)
  @UseGuards(AuthGuard)
  async createDirectMessage(
    @Args('createDirectMessage') createDirectMessage: directMessageInput,
    @CurrentUser() user: JWTUserType,
  ) {
    return await this.messageService.createDirectMessage(
      createDirectMessage,
      user.id,
    );
  }
  @Query((returns) => [UserDirectMessageTypes])
  @UseGuards(AuthGuard)
  async getSenderDirectMessage(@CurrentUser() user: JWTUserType) {
    return await this.messageService.getSenderMessages(user.id);
  }
  @Query((returns) => [UserDirectMessageTypes])
  @UseGuards(AuthGuard)
  async getReceiverDirectMessage(@CurrentUser() user: JWTUserType) {
    return await this.messageService.getReceiverMessages(user.id);
  }
}
