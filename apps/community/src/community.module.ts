import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLUserInterceptor } from '@app/common/interceptor/user.interceptor';
import { DatabaseModule } from './datasource/datasource.module';
import { CommunityResolver } from './community.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community, CommunityMessage, RmqModule, User } from '@app/common';
import * as Joi from 'joi';
import { AUTH_SERVICE } from './constants/services';
import { CommunityController } from './community.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/community/.env',
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_COMMUNITY_QUEUE: Joi.string().required(),
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
      name: AUTH_SERVICE,
    }),
  ],
  providers: [
    CommunityService,
    CommunityResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLUserInterceptor,
    },
  ],
  controllers: [CommunityController],
})
export class CommunityModule {}
