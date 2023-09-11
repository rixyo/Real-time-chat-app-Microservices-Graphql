import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, IsNotEmpty, IsUUID } from 'class-validator';
@InputType()
export class CreateCommunityInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
  @Field()
  @MaxLength(100)
  description: string;
}
