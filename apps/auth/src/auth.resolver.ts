import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { LoginInput } from './inputs/login.input';
import { AuthorizationType } from './type/authorization.type';
import { AuthService } from './auth.service';
import { RegistationInput } from './inputs/registration.input';
import { UserType } from '../../../libs/common/src/type/user.type';
import { CurrentUser, JWTUserType } from '@app/common';
import { DeleteType } from './type/delete.type';
@Resolver((of) => UserType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((returns) => AuthorizationType)
  async register(
    @Args('registrationInput') registrationInput: RegistationInput,
  ) {
    return await this.authService.register(registrationInput);
  }

  @Mutation((returns) => AuthorizationType)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return await this.authService.login(loginInput);
  }
  @Query((returns) => UserType)
  async getUser(@CurrentUser() user: JWTUserType) {
    return await this.authService.getUser(user.id);
  }
  @Query((returns) => [UserType])
  async getUsers() {
    return await this.authService.getUsers();
  }
  @Mutation((returns) => DeleteType)
  async deleteUsers() {
    return await this.authService.deleteAllUsers();
  }
}
