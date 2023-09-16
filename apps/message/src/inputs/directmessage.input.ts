import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, MaxLength } from 'class-validator';
@InputType()
export class directMessageInput {
  @IsUUID()
  @Field((type) => String)
  receiverId: string;
  @IsNotEmpty()
  @MaxLength(100)
  @Field((type) => String)
  content: string;
}
