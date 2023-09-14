import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Community, CommunityMessage, RmqModule, User } from '@app/common';
import { DatabaseModule } from './datasource/datasource.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import * as Joi from 'joi';
import { COMMUNITY_SERVICE } from './constants/services';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: Joi.object({
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, CommunityMessage, Community]),
    RmqModule.register({
      name: COMMUNITY_SERVICE,
    }),
  ],
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule {}
