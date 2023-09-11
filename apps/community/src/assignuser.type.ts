import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class AssignUserResponseType {
  @Field()
  message: string;
}
