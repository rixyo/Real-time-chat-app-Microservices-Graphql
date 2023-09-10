import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CommunityType } from './community.type';
import { CommunityMessageType } from './message.type';
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
  //@Field(() => [CommunityType], { nullable: 'itemsAndList' })
  //communities: CommunityType[];
  //@Field(() => [CommunityMessageType], { nullable: 'itemsAndList' })
  // messages: CommunityMessageType[];
}
