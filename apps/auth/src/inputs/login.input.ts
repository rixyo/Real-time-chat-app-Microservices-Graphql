import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength, IsEmail, IsNotEmpty } from 'class-validator';
@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
