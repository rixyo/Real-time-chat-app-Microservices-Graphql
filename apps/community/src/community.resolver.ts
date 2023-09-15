import { CommunityType } from '@app/common/type/community.type';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { CreateCommunityInput } from './inputs/create.input';
import { AuthGuard, CurrentUser, JWTUserType } from '@app/common';
import { UseGuards } from '@nestjs/common';
import { AssignUserToCommunity } from './inputs/assignuser.input';
import { AssignUserResponseType } from './assignuser.type';
import { UserType } from '@app/common/type/user.type';
import { CommunityMessageTypeFromCommunity } from './types/community.message.type';

@Resolver((of) => CommunityType)
export class CommunityResolver {
  constructor(private communityService: CommunityService) {}
  @Mutation((returns) => CommunityType)
  @UseGuards(AuthGuard)
  async createCommunity(
    @Args('createCommunity') createCommunity: CreateCommunityInput,
    @CurrentUser() user: JWTUserType,
  ) {
    return await this.communityService.createCommunity(
      createCommunity,
      user.id,
    );
  }
  @Mutation((returns) => AssignUserResponseType)
  async deleteCommunitys() {
    return await this.communityService.deleteAllCommunities();
  }
  @Query((returns) => CommunityType)
  async getCommunity(@Args('id') id: string) {
    return await this.communityService.getCommunity(id);
  }
  @Query((returns) => [CommunityType])
  async getCommunities() {
    return await this.communityService.getCommunities();
  }
  @Mutation((returns) => AssignUserResponseType)
  @UseGuards(AuthGuard)
  async assignUserToCommunity(
    @Args('assignUserToCommunity') assignUserToCommunity: AssignUserToCommunity,
    @CurrentUser() user: JWTUserType,
  ) {
    return await this.communityService.assignUserToCommunity(
      assignUserToCommunity,
      user.id,
    );
  }
  @Query((returns) => [UserType])
  @UseGuards(AuthGuard)
  async getUsersFromCommunity(@Args('id') id: string) {
    return await this.communityService.getCommunityUsers(id);
  }
  @Query((returns) => [CommunityMessageTypeFromCommunity])
  async getCommunityMessages(@Args('id') id: string) {
    return await this.communityService.getCommunityMessages(id);
  }
}
