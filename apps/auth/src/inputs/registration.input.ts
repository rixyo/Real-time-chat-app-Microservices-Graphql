import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength, IsEmail, IsNotEmpty } from 'class-validator';
@InputType()
export class RegistationInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  fullName: string;
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
