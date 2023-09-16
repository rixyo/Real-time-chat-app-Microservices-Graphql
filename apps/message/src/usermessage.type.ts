import { UserType } from '@app/common/type/user.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType('UserDirectMessageTypes')
export class UserDirectMessageTypes {
  @Field((type) => ID)
  id: string;
  @Field()
  content: string;
  @Field({ nullable: true })
  fileUrl?: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field((type) => UserType)
  user: UserType;
}
