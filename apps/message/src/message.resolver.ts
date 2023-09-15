import { CommunityMessageType } from '@app/common/type/message.type';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { AuthGuard, CurrentUser, JWTUserType } from '@app/common';
import { sendMessageToCommunity } from './inputs/communitmessage.input';
import { UseGuards } from '@nestjs/common';
@Resolver((of) => CommunityMessageType)
export class MessageResolver {
  constructor(private messageService: MessageService) {}
  @Query((returns) => CommunityMessageType)
  async getMessage(@Args('id') id: string) {
    return 'Hello World';
  }
  @Mutation((returns) => CommunityMessageType)
  @UseGuards(AuthGuard)
  async sendMessageToCommunity(
    @Args('messageToCommunity') messageToCommunity: sendMessageToCommunity,
    @CurrentUser() user: JWTUserType,
  ) {
    return await this.messageService.createMessage(messageToCommunity, user.id);
  }
}
