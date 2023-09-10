import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '@app/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistationInput } from './inputs/registration.input';
import { AuthorizationType } from './type/authorization.type';
import { LoginInput } from './inputs/login.input';
import { UserType } from '../../../libs/common/src/type/user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async createStudent(
    createUser: RegistationInput,
  ): Promise<AuthorizationType> {
    const existingStudent = await this.userRepository.findOne({
      where: {
        email: createUser.email,
      },
    });
    if (existingStudent) throw new ConflictException('Student already exists');
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
    query
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.communities', 'communities');
    const user = await query.getOne();
    return user;
  }
  async getUserCommunities(id: string) {
    const query = this.userRepository.createQueryBuilder('user');
    query
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.communities', 'communities');
    const user = await query.getOne();
    return user;
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
}
