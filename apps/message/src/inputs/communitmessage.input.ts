import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, MaxLength } from 'class-validator';
@InputType()
export class sendMessageToCommunity {
  @IsUUID()
  @Field((type) => String)
  communityId: string;
  @IsNotEmpty()
  @MaxLength(100)
  @Field((type) => String)
  content: string;
}
