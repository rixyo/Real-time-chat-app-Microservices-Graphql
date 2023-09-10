import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';

@Module({
  imports: [],
  providers: [CommunityService],
})
export class CommunityModule {}
