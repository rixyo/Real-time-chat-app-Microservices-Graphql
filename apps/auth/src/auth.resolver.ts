import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { LoginInput } from './inputs/login.input';
import { AuthorizationType } from './type/authorization.type';
import { AuthService } from './auth.service';
import { RegistationInput } from './inputs/registration.input';
import { UserType } from '../../../libs/common/src/type/user.type';
@Resolver((of) => UserType)
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation((returns) => AuthorizationType)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return await this.authService.login(loginInput);
  }
  @Mutation((returns) => AuthorizationType)
  async signup(@Args('createUser') createUser: RegistationInput) {
    return await this.authService.createStudent(createUser);
  }
  @Query((returns) => UserType)
  async getUser(@Args('id') id: string) {
    return await this.authService.getUser(id);
  }
}
