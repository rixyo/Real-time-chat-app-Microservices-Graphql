import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Community, CommunityMessage, User } from '@app/common';
import { DatabaseModule } from './datasource/datasource.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    DatabaseModule,

    TypeOrmModule.forFeature([User, CommunityMessage, Community]),
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
