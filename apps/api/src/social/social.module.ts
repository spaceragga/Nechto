import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';
import { ContentEngagementService } from './content-engagement.service';
import { EngagementService } from './engagement.service';
import { FollowService } from './follow.service';
import { PublicTargetService } from './resolve-public-target';
import { SocialController } from './social.controller';

@Module({
  imports: [AuthModule, NotificationsModule, StorageModule],
  controllers: [SocialController],
  providers: [
    PublicTargetService,
    ContentEngagementService,
    EngagementService,
    FollowService,
  ],
})
export class SocialModule {}
