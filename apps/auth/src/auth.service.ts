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
import { COMMUNITY_SERVICE } from './constants/services';
import { lastValueFrom } from 'rxjs';
import { GettingDataFromCommunityService } from './auth.controller';
import { DeleteType } from './type/delete.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(COMMUNITY_SERVICE) private readonly authServiceClient: ClientProxy,
  ) {}
  async createStudent(
    createUser: RegistationInput,
  ): Promise<AuthorizationType> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUser.email,
      },
    });
    if (existingUser) throw new ConflictException('User already exists');
    const password = await this.hashPassword(createUser.password);
    const user = this.userRepository.create({
      fullName: createUser.fullName,
      email: createUser.email,
      password,
    });
    await this.userRepository.save(user);
    const token = await this.createToken(user.id, user.fullName);
    return {
      access_token: token,
    };
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
    const token = await this.createToken(user.id, user.fullName);
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
  async assignUserToCommunity(
    data: GettingDataFromCommunityService,
  ): Promise<void> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .whereInIds(data.userIds)
      .getMany();
    await lastValueFrom(
      this.authServiceClient.emit('return-users-from-auth-service', {
        users,
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
  private async createToken(userId: string, fullName: string): Promise<string> {
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
