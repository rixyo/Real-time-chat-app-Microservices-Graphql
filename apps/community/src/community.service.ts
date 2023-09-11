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
  private receivedUsers: User[] = [];
  async createCommunity(
    createCommunityInput: CreateCommunityInput,
    userId: string,
  ): Promise<Community> {
    const newCommunity = {
      ...createCommunityInput,
      creatorId: 'dc4a967b-0fb7-4a38-ba12-104747e72e0c',
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
    const communities = await this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.users', 'user')
      .getMany();
    return communities;
  }
  async assignUserToCommunity(
    assignUserToCommunity: AssignUserToCommunity,
  ): Promise<AssignUserResponseType> {
    await this.sendUserIdsToAuthService(assignUserToCommunity.userIds);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = this.processReceivedUsers();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data, 'data from function');
    console.log(data.length, 'data length');
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
    }
    if (!Array.isArray(community.users)) {
      community.users = [];
    }

    // Check if the user is not already a part of the community to avoid duplicates
    for (const user of data) {
      if (
        !community.users.find((existingUser) => existingUser.id === user.id)
      ) {
        community.users.push(user);
      }
    }

    try {
      await this.communityRepository.save(community);
      return {
        message: 'Users assigned to community',
      };
    } catch (error) {
      // Handle the error, e.g., log it or return an error message
      console.error('Error assigning users to community:', error);
      return {
        message: 'Error assigning users to community',
      };
    }
  }

  private async sendUserIdsToAuthService(userIds: string[]): Promise<boolean> {
    await lastValueFrom(
      this.authServiceClient.emit('assign-user-to-community', {
        userIds,
      }),
    );
    return true;
  }
  receiveUsersFromAuthService(data: any) {
    this.receivedUsers = data.users;
  }
  processReceivedUsers() {
    // Access the receivedUsers data in this method
    return this.receivedUsers;
    // Perform further processing or return the users
  }
}
