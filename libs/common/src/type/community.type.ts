import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType('Community')
export class CommunityType {
  @Field((type) => ID)
  id: string;
  @Field()
  name: string;
  @Field()
  description: string;
  @Field({ nullable: true })
  avatalUrl?: string;
  @Field()
  creatorId: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field((type) => [ID])
  userIds: string[];
  @Field((type) => [ID])
  messageIds: string[];
}
