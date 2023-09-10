import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunityService {
  getHello(): string {
    return 'Hello World!';
  }
}
