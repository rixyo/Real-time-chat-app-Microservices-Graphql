import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType('CommunityMessage')
export class CommunityMessageType {
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
}
