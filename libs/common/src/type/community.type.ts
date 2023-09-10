import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { CommunityMessageType } from './message.type';
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
  @Field((type) => [UserType], { nullable: 'itemsAndList' })
  users: UserType[];
  @Field((type) => [CommunityMessageType], { nullable: 'itemsAndList' })
  messages: CommunityMessageType[];
}
