import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType('Authorization')
export class AuthorizationType {
  @Field()
  access_token: string;
}
