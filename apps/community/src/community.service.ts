import { Community } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommunityInput } from './inputs/create.input';
import { AssignUserToCommunity } from './inputs/assignuser.input';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE, MESSAGE_SERVICE } from './constants/services';
import { AssignUserResponseType } from './assignuser.type';
import { UserType } from '@app/common/type/user.type';
import {
  GettingCommunityAndUserId,
  GettingDataFromMessageService,
  ResponseFromMessageServiceWithMessages,
} from './community.controller';
import { CommunityMessageTypeFromCommunity } from './types/community.message.type';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @Inject(AUTH_SERVICE) private readonly authServiceClient: ClientProxy,
    @Inject(MESSAGE_SERVICE) private readonly messageServiceClient: ClientProxy,
  ) {}
  private receivedUsersId: {
    userIds: string[];
  } = {
    userIds: [], // Initialize userIds as an empty array
  };
  private receiveMessages: {
    messages: CommunityMessageTypeFromCommunity[];
  } = {
    messages: [], // Initialize messagesWithUsers as an empty array
  };
  private receivedUsers: {
    users: UserType[];
  } = {
    users: [], // Initialize users as an empty array
  };
  // this method is used to create a community and take userId and createCommunityInput as parameters
  async createCommunity(
    createCommunityInput: CreateCommunityInput,
    userId: string,
  ): Promise<Community> {
    const newCommunity = {
      ...createCommunityInput,
      creatorId: userId,
      userIds: [userId],
    };
    const newcommunity = this.communityRepository.create(newCommunity);
    const community = await this.communityRepository.save(newcommunity);
    await this.updateCreatorCommunity(community.id, userId);
    return community;
  }
  // this method is used to get a community and take id as a parameter
  async getCommunity(id: string): Promise<Community> {
    return await this.communityRepository.findOne({
      where: { id },
    });
  }
  async getCommunities(): Promise<Community[]> {
    return await this.communityRepository.find();
  }
  // this method is used to assign users to a community and take userId and assignUserToCommunity as parameters
  async assignUserToCommunity(
    assignUserToCommunity: AssignUserToCommunity,
    userId: string,
  ): Promise<AssignUserResponseType> {
    await this.sendUserIdsToAuthService(
      assignUserToCommunity.userIds,
      assignUserToCommunity.communityId,
    );
    // Wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Access the receivedUsersId data from the authService in this method
    const data = this.processReceivedUsersId();
    // Wait for 1 second
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
  // this method is used to update creator community and take communityId and userId as parameters
  private async updateCreatorCommunity(
    communityId: string,
    userId: string,
  ): Promise<void> {
    await lastValueFrom(
      this.authServiceClient.emit('update-user', {
        communityId: communityId,
        userId: userId,
      }),
    );
  }
  // this method is used to get community users and take communityId as a parameter
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
  // check if user is in community from message service and send response to message service
  async checkIfUserIsInCommunity(
    data: GettingCommunityAndUserId,
  ): Promise<void> {
    const community = await this.communityRepository.findOne({
      where: { id: data.communityId },
    });
    if (!community) {
      await lastValueFrom(
        this.messageServiceClient.emit('response-from-community-service', {
          response: false,
        }),
      );
    } else if (community.creatorId === data.userId) {
      await lastValueFrom(
        this.messageServiceClient.emit('response-from-community-service', {
          response: true,
        }),
      );
    } else if (community.userIds.includes(data.userId)) {
      await lastValueFrom(
        this.messageServiceClient.emit('response-from-community-service', {
          response: true,
        }),
      );
    } else {
      await lastValueFrom(
        this.messageServiceClient.emit('response-from-community-service', {
          response: false,
        }),
      );
    }
  }
  // this method is used to send message to community and take messageId and communityId as parameters
  async getCommunityMessages(communityId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });
    if (!community) {
      throw new Error('Community not found');
    }
    await this.sendCommunityIdToMessageService(communityId);
    // Wait for 3 seconds to allow the message service to process the request
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = this.processReceivedMessages();
    const messagesWithUsers = data;
    return messagesWithUsers;
  }
  async sendCommunityIdToMessageService(communityId: string): Promise<void> {
    await lastValueFrom(
      this.messageServiceClient.emit('get-community-messages', {
        communityId: communityId,
      }),
    );
  }
  //  this method is used to get community messages from message service and take data as a parameter
  async getCommunityMessagesFromMessageService(
    data: ResponseFromMessageServiceWithMessages,
  ): Promise<void> {
    this.receiveMessages = data;
  }
  private processReceivedMessages() {
    return this.receiveMessages.messages;
  }
  // this method is used to process received messages
  async deleteAllCommunities(): Promise<AssignUserResponseType> {
    await this.communityRepository.delete({});
    return {
      message: 'All communities deleted',
    };
  }
  // this method is used to send user ids to auth service and take userIds and communityId as parameters
  private async sendUserIdsToAuthService(
    userIds: string[],
    communityId: string,
  ): Promise<boolean> {
    await lastValueFrom(
      this.authServiceClient.emit('assign-user-to-community', {
        userIds,
        communityId,
      }),
    );
    return true;
  }
  // this method is used to send community users id to auth service and take userIds as a parameter
  private async sendCommunityUsersIdToAuthService(
    userIds: string[],
  ): Promise<void> {
    await lastValueFrom(
      this.authServiceClient.emit('get-community-users', {
        userIds,
      }),
    );
  }
  // this method is used to update community message and take data as a parameter
  async updateCommunityMessage(
    data: GettingDataFromMessageService,
  ): Promise<void> {
    const community = await this.communityRepository.findOne({
      where: { id: data.communityId },
    });
    if (!community) {
      throw new Error('Community not found');
    }
    community.messageIds.push(data.messageId);
    try {
      await this.communityRepository.save(community);
    } catch (error) {
      console.error('Error updating community message:', error);
    }
  }
  // this method is used to receive users id from auth service and take data as a parameter
  async receiveUsersIdFromAuthService(data: any) {
    this.receivedUsersId = data;
  }
  // this method is used to process received users id
  private processReceivedUsersId() {
    // Access the receivedUsers data in this method
    return this.receivedUsersId;
    // Perform further processing or return the usersId
  }
  // this method is used to receive users from auth service and take data as a parameter
  async receiveUsersFromAuthService(data: any) {
    this.receivedUsers = data;
  }
  // this method is used to process received users
  private processReceivedUsers() {
    // Access the receivedUsers data in this method
    return this.receivedUsers;
    // Perform further processing or return the users
  }
}
