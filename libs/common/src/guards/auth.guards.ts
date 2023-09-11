import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
type JWTPayload = {
  userId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    try {
      const token = this.getTokenFromRequest(req);
      if (!token) {
        return false; // No token found, deny access.
      }

      const user = jwt.verify(token, 'mysupersecret') as JWTPayload;
      req.user = user;
      if (user) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private getTokenFromRequest(req: any): string | null {
    return req.headers.authorization?.split('Bearer ')[1] || null;
  }
}
