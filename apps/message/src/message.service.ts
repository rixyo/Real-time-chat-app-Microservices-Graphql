import { CommunityMessage } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sendMessageToCommunity } from './inputs/communitmessage.input';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE, COMMUNITY_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { CommunityMessageType } from '@app/common/type/message.type';
import { SocketGateway } from './socket/socket.gateway';
import { UserType } from '@app/common/type/user.type';
import { directMessageInput } from './inputs/directmessage.input';
import { UserDirectMessageType } from '@app/common/type/directmessage.type';
import { DirectMessage } from '@app/common/entity/directmessage.enity';
import { UserDirectMessageTypes } from './usermessage.type';
import e from 'express';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,
    @InjectRepository(CommunityMessage)
    private messageRepository: Repository<CommunityMessage>,
    @Inject(AUTH_SERVICE) private readonly authServiceClient: ClientProxy,
    @Inject(COMMUNITY_SERVICE)
    private readonly communityServiceClient: ClientProxy,
    private readonly socketGateway: SocketGateway,
  ) {}
  private receiveResponseFromCommunityService: {
    response: boolean;
  } = {
    response: false,
  };
  private receivedUsers: {
    users: UserType[];
  } = {
    users: [], // Initialize users as an empty array
  };
  async createMessage(
    sendMessage: sendMessageToCommunity,
    userId: string,
  ): Promise<CommunityMessageType> {
    await this.sendUserIdAndCommunityIdToCommunityServer(
      userId,
      sendMessage.communityId,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const responseFromCommunity = this.processResponseFromCommunityService();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!responseFromCommunity.response) {
      throw new Error('User is not in community');
    }

    const newMessage = this.messageRepository.create({
      communityId: sendMessage.communityId,
      userId: userId,
      content: sendMessage.content,
    });
    const message = await this.messageRepository.save(newMessage);
    await this.sendMessageToCommunityService(message.id, message.communityId);
    this.socketGateway.server.emit('chatMessage', message);
    return message;
  }
  async createDirectMessage(
    createDirectMessage: directMessageInput,
    senderId: string,
  ): Promise<UserDirectMessageType> {
    const newMessage = this.directMessageRepository.create({
      senderId: senderId,
      receiverId: createDirectMessage.receiverId,
      content: createDirectMessage.content,
    });
    const message = await this.directMessageRepository.save(newMessage);
    this.socketGateway.server.emit('DirectMessage', message);
    await this.updateUserMessage(senderId, message.receiverId, message.id);
    return message;
  }
  async getSenderMessages(userId: string): Promise<UserDirectMessageTypes[]> {
    const sendermessages = await this.directMessageRepository.find({
      where: [{ senderId: userId }],
    });
    if (sendermessages.length > 0) {
      await this.sendMessageUserIdToAuthService(
        sendermessages.map((message) => message.senderId),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = this.processReceivedUsers();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const senderMessages = sendermessages.map((message) => {
        const user = response.users.find(
          (user) => user.id === message.senderId,
        );
        return {
          ...message,
          user,
        };
      });
      return senderMessages;
    } else {
      console.log('no messages');
      return [];
    }
  }
  async getReceiverMessages(userId: string): Promise<UserDirectMessageTypes[]> {
    const receivermessages = await this.directMessageRepository.find({
      where: [{ receiverId: userId }],
    });
    if (receivermessages.length > 0) {
      await this.sendMessageUserIdToAuthService(
        receivermessages.map((message) => message.receiverId),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = this.processReceivedUsers();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const receiverMessages = receivermessages.map((message) => {
        const user = response.users.find(
          (user) => user.id === message.receiverId,
        );
        return {
          ...message,
          user,
        };
      });
      return receiverMessages;
    } else {
      console.log('no messages');
      return [];
    }
  }
  // this method is used to update user message and take senderId, receiverId and messageId as parameters
  private async updateUserMessage(
    senderId: string,
    receiverId: string,
    messageId: string,
  ): Promise<void> {
    await lastValueFrom(
      this.authServiceClient.emit('updateUserMessage', {
        senderId,
        receiverId,
        messageId,
      }),
    );
  }
  private async sendUserIdAndCommunityIdToCommunityServer(
    userId: string,
    communityId: string,
  ): Promise<void> {
    await lastValueFrom(
      this.communityServiceClient.emit('checkIfUserIsInCommunity', {
        userId,
        communityId,
      }),
    );
  }
  async sendCommunityMessageToCommunityServer(
    communityId: string,
  ): Promise<void> {
    const messages = await this.messageRepository.find({
      where: { communityId: communityId },
    });
    await this.sendMessageUserIdToAuthService(
      messages.map((message) => message.userId),
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = this.processReceivedUsers();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const messagesWithUsers = messages.map((message) => {
      const user = response.users.find((user) => user.id === message.userId);
      return {
        ...message,
        user,
      };
    });
    await lastValueFrom(
      this.communityServiceClient.emit('sendCommunityMessagesWithUsers', {
        messages: messagesWithUsers,
      }),
    );
  }
  // this method is used to send user id to auth service for getting user data
  private async sendMessageUserIdToAuthService(
    userIds: string[],
  ): Promise<void> {
    await lastValueFrom(
      this.authServiceClient.emit('getUsersByIdsFromMessageService', {
        userIds: userIds,
      }),
    );
  }
  async getUsersFromAuthService(data: any): Promise<void> {
    this.receivedUsers = data;
  }
  private processReceivedUsers() {
    return this.receivedUsers;
  }
  async responseIsUserAndCommunityExitFromCommunityService(
    data: any,
  ): Promise<void> {
    this.receiveResponseFromCommunityService = data;
  }
  private processResponseFromCommunityService() {
    return this.receiveResponseFromCommunityService;
  }
  private async sendMessageToCommunityService(
    messageId: string,
    communityId: string,
  ): Promise<void> {
    await lastValueFrom(
      this.communityServiceClient.emit('sendMessageToCommunity', {
        messageId: messageId,
        communityId: communityId,
      }),
    );
  }
}
