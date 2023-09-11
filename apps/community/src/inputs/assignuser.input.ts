import { Field, InputType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
@InputType()
export class AssignUserToCommunity {
  @IsUUID()
  @Field((type) => String)
  communityId: string;
  @IsUUID('4', { each: true })
  @Field((type) => [String])
  userIds: string[];
}
