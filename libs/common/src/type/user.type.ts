import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;
  @Field()
  fullName: string;
  @Field()
  email: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field((type) => [ID])
  communityIds: string[];
  @Field((type) => [ID])
  messageIds: string[];
}
