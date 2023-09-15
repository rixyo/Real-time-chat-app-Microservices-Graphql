import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '@app/common';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistationInput } from './inputs/registration.input';
import { AuthorizationType } from './type/authorization.type';
import { LoginInput } from './inputs/login.input';
import { UserType } from '../../../libs/common/src/type/user.type';
import { ClientProxy } from '@nestjs/microservices';
import { COMMUNITY_SERVICE, MESSAGE_SERVICE } from './constants/services';
import { lastValueFrom } from 'rxjs';
import {
  GettingDataFromCommunityService,
  UpdateCreatorCommunityId,
} from './auth.controller';
import { DeleteType } from './type/delete.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(COMMUNITY_SERVICE)
    private readonly communityServiceClient: ClientProxy,
    @Inject(MESSAGE_SERVICE) private readonly messageServiceClient: ClientProxy,
  ) {}
  async register(
    registrationInput: RegistationInput,
  ): Promise<AuthorizationType> {
    try {
      const hashedPassword = await this.hashPassword(
        registrationInput.password,
      );
      const user = this.userRepository.create({
        ...registrationInput,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      const token = this.createToken(user.id, user.fullName);
      return {
        access_token: token,
      };
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  async login(loginInput: LoginInput): Promise<AuthorizationType> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginInput.email,
      },
    });
    if (!user) throw new ConflictException('User does not exist');
    const isPasswordValid = await this.comparePasswords(
      loginInput.password,
      user.password,
    );
    if (!isPasswordValid) throw new ConflictException('Invalid credentials');
    const token = this.createToken(user.id, user.fullName);
    return {
      access_token: token,
    };
  }
  async getUser(id: string): Promise<UserType> {
    const query = this.userRepository.createQueryBuilder('user');
    query.where('user.id = :id', { id });
    const user = await query.getOne();
    return user;
  }
  // this method is used to assign users to a community and take userId and assignUserToCommunity as parameters
  // has to change data type
  async assignUserToCommunity(data: any): Promise<void> {
    try {
      // have to change this findByIds to queryBuilder. this is working but passing all data
      const users = await this.userRepository.findByIds(data.userIds);
      const userIds = users.map((user) => user.id);
      users.forEach((user) => {
        if (user.communityIds.includes(data.communityId)) return;
        user.communityIds.push(data.communityId);
        this.userRepository.save(user);
      });
      await lastValueFrom(
        this.communityServiceClient.emit('return-users-from-auth-service', {
          userIds: userIds,
        }),
      );
    } catch (error) {
      console.error('Error assigning users to community:', error);
    }
  }
  async updateUserForCommunity(data: UpdateCreatorCommunityId): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });
    if (user.communityIds.includes(data.communityId)) return;
    user.communityIds.push(data.communityId);
    await this.userRepository.save(user);
  }
  async sendComunityUser(data: GettingDataFromCommunityService): Promise<void> {
    const users = await this.userRepository.findByIds(data.userIds);
    console.log(users);
    await lastValueFrom(
      this.communityServiceClient.emit(
        'return-community-users-from-auth-service',
        {
          users: users,
        },
      ),
    );
  }
  // this method is used to send back users to message service
  async sendUsersToMessageService(data: any): Promise<void> {
    // have to change this findByIds to queryBuilder. this is working but passing all data
    const users = await this.userRepository.findByIds(data.userIds);
    await lastValueFrom(
      this.messageServiceClient.emit('return-users-from-auth-service', {
        users: users,
      }),
    );
  }

  async getUsers(): Promise<UserType[]> {
    return await this.userRepository.find();
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  private async comparePasswords(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }
  private createToken(userId: string, fullName: string): string {
    const expiresIn = 60 * 60; // an hour
    const secret = 'mysupersecret';
    const dataStoredInToken = {
      id: userId,
      fullName: fullName,
    };
    return jwt.sign(dataStoredInToken, secret, { expiresIn });
  }
  async deleteAllUsers(): Promise<DeleteType> {
    await this.userRepository.delete({});
    return {
      message: 'All users deleted',
    };
  }
}
