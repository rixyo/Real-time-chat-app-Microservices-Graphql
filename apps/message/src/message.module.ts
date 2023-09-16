import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from './datasource/datasource.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityMessage, DirectMessage, RmqModule } from '@app/common';
import { AUTH_SERVICE, COMMUNITY_SERVICE } from './constants/services';
import { MessageResolver } from './message.resolver';
import { SocketModule } from './socket/socket.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLUserInterceptor } from '@app/common/interceptor/user.interceptor';
import { MessageController } from './message.controller';
import { UserDirectMessageResolver } from './direct.message.resolver';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/community/.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
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
    SocketModule,
    TypeOrmModule.forFeature([DirectMessage, CommunityMessage]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: COMMUNITY_SERVICE,
    }),
  ],
  providers: [
    MessageService,
    UserDirectMessageResolver,
    MessageResolver,

    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLUserInterceptor,
    },
  ],
  controllers: [MessageController],
})
export class MessageModule {}
