import { UserType } from '@app/common/type/user.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType('CommunityMessageTypeFromCommunity')
export class CommunityMessageTypeFromCommunity {
  @Field((type) => ID)
  id: string;
  @Field()
  content: string;
  @Field({ nullable: true })
  fileUrl?: string;
  @Field()
  userId: string;
  @Field()
  communityId: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field((type) => UserType)
  user: UserType;
}
