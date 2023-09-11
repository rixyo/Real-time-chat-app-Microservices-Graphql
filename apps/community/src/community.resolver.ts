import { CommunityType } from '@app/common/type/community.type';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { CreateCommunityInput } from './inputs/create.input';
import { AuthGuard, CurrentUser, JWTUserType } from '@app/common';
import { UseGuards } from '@nestjs/common';
import { AssignUserToCommunity } from './inputs/assignuser.input';
import { AssignUserResponseType } from './assignuser.type';
@Resolver((of) => CommunityType)
export class CommunityResolver {
  constructor(private communityService: CommunityService) {}
  @Mutation((returns) => CommunityType)
  async createCommunity(
    @Args('createCommunity') createCommunity: CreateCommunityInput,
  ) {
    return await this.communityService.createCommunity(
      createCommunity,
      'dc4a967b-0fb7-4a38-ba12-104747e72e0c',
    );
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
  async assignUserToCommunity(
    @Args('assignUserToCommunity') assignUserToCommunity: AssignUserToCommunity,
  ) {
    return await this.communityService.assignUserToCommunity(
      assignUserToCommunity,
    );
  }
}
