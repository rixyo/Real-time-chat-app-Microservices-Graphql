import { Community, User } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommunityInput } from './inputs/create.input';
import { AssignUserToCommunity } from './inputs/assignuser.input';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE } from './constants/services';
import { AssignUserResponseType } from './assignuser.type';
import { UserType } from '@app/common/type/user.type';
import { date } from 'joi';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @Inject(AUTH_SERVICE) private readonly authServiceClient: ClientProxy,
  ) {}
  private receivedUsersId: {
    userIds: string[];
  } = {
    userIds: [], // Initialize userIds as an empty array
  };
  private receivedUsers: {
    users: UserType[];
  } = {
    users: [], // Initialize users as an empty array
  };
  async createCommunity(
    createCommunityInput: CreateCommunityInput,
    userId: string,
  ): Promise<Community> {
    const newCommunity = {
      ...createCommunityInput,
      creatorId: userId,
      userIds: [userId],
    };
    const community = this.communityRepository.create(newCommunity);
    return await this.communityRepository.save(community);
  }
  async getCommunity(id: string): Promise<Community> {
    return await this.communityRepository.findOne({
      where: { id },
    });
  }
  async getCommunities(): Promise<Community[]> {
    return await this.communityRepository.find();
  }
  async assignUserToCommunity(
    assignUserToCommunity: AssignUserToCommunity,
    userId: string,
  ): Promise<AssignUserResponseType> {
    await this.sendUserIdsToAuthService(assignUserToCommunity.userIds);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = this.processReceivedUsersId();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!data) {
      return {
        message: 'No users found',
      };
    }
    const community = await this.communityRepository.findOne({
      where: { id: assignUserToCommunity.communityId },
    });
    if (!community) {
      return {
        message: 'Community not found',
      };
    } else if (community.creatorId !== userId) {
      return {
        message: 'You are not the creator of this community',
      };
    } else if (
      data.userIds.some((userId) => community.userIds.includes(userId))
    ) {
      return {
        message: 'Users already assigned to community',
      };
    }
    community.userIds.push(...data.userIds);
    try {
      await this.communityRepository.save(community);
      return {
        message: 'Users assigned to community',
      };
    } catch (error) {
      console.error('Error assigning users to community:', error);
      return {
        message: 'Error assigning users to community',
      };
    }
  }
  async getCommunityUsers(communityId: string): Promise<UserType[]> {
    try {
      const community = await this.communityRepository.findOne({
        where: { id: communityId },
      });
      if (!community) {
        throw new Error('Community not found');
      }
      await this.sendCommunityUsersIdToAuthService(community.userIds);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = this.processReceivedUsers();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const users = data.users;
      return users;
    } catch (error) {
      console.error('Error getting community users:', error);
      return [];
    }
  }
  async deleteAllCommunities(): Promise<AssignUserResponseType> {
    await this.communityRepository.delete({});
    return {
      message: 'All communities deleted',
    };
  }

  private async sendUserIdsToAuthService(userIds: string[]): Promise<boolean> {
    await lastValueFrom(
      this.authServiceClient.emit('assign-user-to-community', {
        userIds,
      }),
    );
    return true;
  }
  private async sendCommunityUsersIdToAuthService(
    userIds: string[],
  ): Promise<boolean> {
    await lastValueFrom(
      this.authServiceClient.emit('get-community-users', {
        userIds,
      }),
    );
    return true;
  }
  async receiveUsersIdFromAuthService(data: any) {
    this.receivedUsersId = data;
  }
  private processReceivedUsersId() {
    // Access the receivedUsers data in this method
    return this.receivedUsersId;
    // Perform further processing or return the usersId
  }
  async receiveUsersFromAuthService(data: any) {
    this.receivedUsers = data;
  }
  private processReceivedUsers() {
    // Access the receivedUsers data in this method
    return this.receivedUsers;
    // Perform further processing or return the users
  }
}
