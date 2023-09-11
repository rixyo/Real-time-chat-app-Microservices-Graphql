import {
  Injectable,
  ExecutionContext,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class GraphQLUserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const token = req.headers.authorization?.split('Bearer ')[1];
    const user = jwt.decode(token);
    req.user = user;
    ctx.getContext().user = user;
    return next.handle();
  }
}
