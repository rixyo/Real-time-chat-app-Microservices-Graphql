import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class UserDirectMessageType {
  @Field((type) => ID)
  id: string;
  @Field()
  content: string;
  @Field({ nullable: true })
  fileUrl?: string;
  @Field()
  senderId: string;
  @Field()
  receiverId: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
