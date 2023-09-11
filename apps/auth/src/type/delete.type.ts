import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType('DeleteType')
export class DeleteType {
  @Field()
  message: string;
}
